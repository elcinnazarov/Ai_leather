package com.aiatelye.leather.service.pricing;

import com.aiatelye.leather.dao.PricingRule;
import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.*;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.error.Exception.BaseProductGradePriceNotFoundException;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.mapper.ManualPriceMapper;
import com.aiatelye.leather.repository.PricingRuleRepository;
import com.aiatelye.leather.repository.ProductGradePriceRepository;
import com.aiatelye.leather.repository.ProductModelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManualPriceService {

    private final ProductGradePriceRepository productGradePriceRepository;
    private final ProductModelRepository productModelRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final ManualPriceMapper manualPriceMapper;
    private final CalculatePriceService calculatePriceService;

    @Transactional
    public ListManuelPricesResponse createManualPrices(Long productModelId, ListCreateManualPricesRequest request) {
        log.info("Creating manual prices for product: {}", productModelId);

        // 1. Məhsulu tapırıq
        ProductModel product = productModelRepository.findById(productModelId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productModelId));

        // 2. N+1 Həlli: Lazım olan bütün GradeID-ləri toplayırıq
        List<Long> gradeIds = request.getManualPrices().stream()
                .map(CreateManualPriceRequest::getGradeId)
                .toList();

        // 3. N+1 Həlli: Bütün qiymətləri və qaydaları BİR DƏFƏYƏ çəkirik
        Map<Long, ProductGradePrice> priceMap =getPriceMap(productModelId,gradeIds);
        Map<Enums.Currency, PricingRule> rulesMap = getRulesMap();

        List<ManualPriceResponse> successList = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        List<ProductGradePrice> pricesToUpdate = new ArrayList<>();

        // 4. Emal zənciri (Bazaya sorğu yoxdur, hər şey RAM-da baş verir)
        for (CreateManualPriceRequest priceRequest : request.getManualPrices()) {
            try {
                if (priceRequest.getCurrency() == Enums.Currency.AZN) {
                    errors.add("Grade " + priceRequest.getGradeId() + ": Cannot set manual price for AZN");
                    continue;
                }

                ProductGradePrice price = priceMap.get(priceRequest.getGradeId());
                if (price == null) throw new BaseProductGradePriceNotFoundException("Base price for grade " + priceRequest.getGradeId() + " not found");

                PricingRule rule = rulesMap.get(priceRequest.getCurrency());
                BigDecimal autoCalculated = calculatePriceService.calculateAutoPrice(price.getPrice(), rule);

                // Manual qiyməti set edirik
                if (priceRequest.getCurrency() == Enums.Currency.USD) {
                    price.setManualUsd(priceRequest.getManualPrice());
                } else {
                    price.setManualEur(priceRequest.getManualPrice());
                }

                pricesToUpdate.add(price);

                successList.add(manualPriceMapper.toResponse(
                        price, priceRequest.getCurrency(), priceRequest.getManualPrice(), autoCalculated
                ));

            } catch (Exception e) {
                errors.add("Grade " + priceRequest.getGradeId() + ": " + e.getMessage());
            }
        }

        // 5. Batch Update: Sonda hamısını bir dəfəyə yadda saxlayırıq
        if (!pricesToUpdate.isEmpty()) {
            productGradePriceRepository.saveAll(pricesToUpdate);
        }

        // 6. Builder ilə Response (Daha təmiz)
        return ListManuelPricesResponse.builder()
                .productModelId(productModelId)
                .productModelName(product.getModelname())
                .manualPrices(successList)
                .totalCount(request.getManualPrices().size())
                .successCount(successList.size())
                .errors(errors)
                .build();
    }

    @Transactional(readOnly = true)
    public ListManuelPricesResponse getManualPrices(Long productModelId) {
        log.info("Fetching manual prices for product: {}", productModelId);


        ProductModel product = productModelRepository.findById(productModelId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productModelId));


        Map<Enums.Currency, PricingRule> rulesMap =getRulesMap();

        //Qiymət siyahısını çəkirik
        List<ProductGradePrice> prices = productGradePriceRepository.findByProductModelId(productModelId);
        List<ManualPriceResponse> responses = new ArrayList<>();

        for (ProductGradePrice price : prices) {
            // USD üçün: Bazaya getmək yerinə Map-dən (RAM) götürürük
            if (price.getManualUsd() != null) {
                PricingRule usdRule = rulesMap.get(Enums.Currency.USD);
                BigDecimal autoUsd = calculatePriceService.calculateAutoPrice(price.getPrice(), usdRule);

                responses.add(manualPriceMapper.toResponse(
                        price, Enums.Currency.USD, price.getManualUsd(), autoUsd
                ));
            }

            // EUR üçün: Bazaya getmək yerinə Map-dən (RAM) götürürük
            if (price.getManualEur() != null) {
                PricingRule eurRule = rulesMap.get(Enums.Currency.EUR);
                BigDecimal autoEur = calculatePriceService.calculateAutoPrice(price.getPrice(), eurRule);

                responses.add(manualPriceMapper.toResponse(
                        price, Enums.Currency.EUR, price.getManualEur(), autoEur
                ));
            }
        }

        return ListManuelPricesResponse.builder()
                .productModelId(productModelId)
                .productModelName(product.getModelname())
                .manualPrices(responses)
                .totalCount(responses.size())
                .successCount(responses.size())
                .errors(Collections.emptyList()) // New ArrayList yerinə daha performanslı Collections.emptyList()
                .build();
    }


    @Transactional
    public ListManuelPricesResponse updateManualPrices(Long productModelId,  ListCreateManualPricesRequest request) {
        log.info("Updating manual prices for product: {}", productModelId);

        // 1. Məhsulu tapırıq
        ProductModel product = productModelRepository.findById(productModelId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productModelId));

        // 2. ADDIM 1: Bütün aktiv qaydaları bir dəfəyə çəkib Map-ə yığırıq (N+1 həlli)
        Map<Enums.Currency, PricingRule> rulesMap = pricingRuleRepository.findAllByIsActiveTrue()
                .stream()
                .collect(Collectors.toMap(PricingRule::getTargetCurrency, rule -> rule, (existing, replacement) -> existing));

        List<ManualPriceResponse> successList = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (CreateManualPriceRequest priceRequest : request.getManualPrices()) {
            try {
                // Validasiya: AZN manual ola bilməz
                if (priceRequest.getCurrency() == Enums.Currency.AZN) {
                    errors.add("Grade " + priceRequest.getGradeId() + ": Cannot set manual price for base currency (AZN)");
                    continue;
                }

                // Base qiyməti tapırıq
                ProductGradePrice price = productGradePriceRepository.findByProductModelIdAndGradeId(productModelId, priceRequest.getGradeId())
                        .orElseThrow(() -> new BaseProductGradePriceNotFoundException("base price not set"));

                // Köhnə qiyməti loglama üçün saxlayırıq
                BigDecimal oldManual = (priceRequest.getCurrency() == Enums.Currency.USD) ? price.getManualUsd() : price.getManualEur();

                // Manual qiyməti set edirik
                if (priceRequest.getCurrency() == Enums.Currency.USD) {
                    price.setManualUsd(priceRequest.getManualPrice());
                } else {
                    price.setManualEur(priceRequest.getManualPrice());
                }


                ProductGradePrice saved = productGradePriceRepository.save(price);

                // 3. Map-dən qaydanı O(1) sürəti ilə götürürük (Bazaya getmirik!)
                PricingRule rule = rulesMap.get(priceRequest.getCurrency());
                BigDecimal autoCalculated = calculatePriceService.calculateAutoPrice(price.getPrice(), rule);

                // Response-a çevirmə (Mapper vasitəsilə)
                ManualPriceResponse response = manualPriceMapper.toResponse(
                        saved,
                        priceRequest.getCurrency(),
                        priceRequest.getManualPrice(),
                        autoCalculated
                );

                successList.add(response);
                log.info("Manual price updated: {} {} -> {} for grade {}",
                        priceRequest.getCurrency(), oldManual, priceRequest.getManualPrice(), priceRequest.getGradeId());

            } catch (Exception e) {
                log.error("Error processing price for grade {}: {}", priceRequest.getGradeId(), e.getMessage());
                errors.add("Grade " + priceRequest.getGradeId() + ": " + e.getMessage());
            }
        }

        return buildBatchResponse(productModelId, product.getModelname(), successList, errors, request.getManualPrices().size());
    }



    private ListManuelPricesResponse buildBatchResponse(Long id, String name, List<ManualPriceResponse> success, List<String> errors, int total) {
        return ListManuelPricesResponse.builder()
                .productModelId(id)
                .productModelName(name)
                .manualPrices(success)
                .totalCount(total)
                .successCount(success.size()) // Hesablamanı birbaşa burada edirik
                .errors(errors)
                .build();
    }


    @Transactional
    public ListManuelPricesResponse deleteManualPrices(Long productModelId,
                                                       ListDeleteManualPricesRequest request) {

        ProductModel product = productModelRepository.findById(productModelId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

// Datatları hazırla
        Set<Long> gradeIds = request.getManualPrices()
                .stream()
                .map(DeleteManualPriceRequest::getGradeId)
                .collect(Collectors.toSet());

        Map<Long, ProductGradePrice> priceMap = getPriceMap(productModelId, gradeIds);
        Map<Enums.Currency, PricingRule> rulesMap = getRulesMap();

        List<ManualPriceResponse> deletedList = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        List<ProductGradePrice> toUpdate = new ArrayList<>();

        // İcra et
        for (DeleteManualPriceRequest req : request.getManualPrices()) {
            try {
                processSingleDelete(req, priceMap, rulesMap, deletedList, toUpdate);
            } catch (Exception e) {
                errors.add("Grade " + req.getGradeId() + ": " + e.getMessage());
            }
        }

        if (!toUpdate.isEmpty()) productGradePriceRepository.saveAll(toUpdate);


        return ListManuelPricesResponse.builder()
                .productModelId(product.getId())
                .productModelName(product.getModelname())
                .manualPrices(deletedList)
                .totalCount(request.getManualPrices().size())
                .successCount(deletedList.size()) // Hesablamanı birbaşa burada edirik
                .errors(errors)
                .build();


    }

    private void processSingleDelete(DeleteManualPriceRequest req,
                                     Map<Long, ProductGradePrice> priceMap,
                                     Map<Enums.Currency, PricingRule> rulesMap,
                                     List<ManualPriceResponse> successList,
                                     List<ProductGradePrice> toUpdate) {

        ProductGradePrice price = priceMap.get(req.getGradeId());
        if (price == null) throw new NotFoundException("Price not found");

        // Manual qiyməti təmizlə
        if (req.getCurrency() == Enums.Currency.USD) price.setManualUsd(null);
        else price.setManualEur(null);

        // Yeni avto qiyməti hesabla
        PricingRule rule = rulesMap.get(req.getCurrency());
        BigDecimal autoPrice = calculatePriceService.calculateAutoPrice(price.getPrice(), rule);

        toUpdate.add(price);
        successList.add(manualPriceMapper.toResponse(price, req.getCurrency(), null, autoPrice));
    }

        //for delete
        private Map<Long, ProductGradePrice> getPriceMap(Long productId, Set<Long> gradeIds) {
            return productGradePriceRepository.findByProductModelIdAndGradeIdIn(productId, gradeIds)
                    .stream()
                    .collect(Collectors.toMap(ProductGradePrice::getId, p -> p));
        }
        //for create
        private Map<Long, ProductGradePrice> getPriceMap(Long productId, List<Long> gradeIds) {
            return productGradePriceRepository.findByProductModelIdAndGradeIdIn(productId, gradeIds)
                    .stream()
                    .collect(Collectors.toMap(ProductGradePrice::getId, p -> p));
        }

        private Map<Enums.Currency, PricingRule> getRulesMap() {
            return pricingRuleRepository.findAllByIsActiveTrue()
                    .stream()
                    .collect(Collectors.toMap(PricingRule::getTargetCurrency, r -> r));
        }
    }