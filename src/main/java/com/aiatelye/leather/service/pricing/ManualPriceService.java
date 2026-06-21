package com.aiatelye.leather.service.pricing;

import com.aiatelye.leather.dao.PricingRule;
import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.admin.price.manuel.*;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.error.Exception.BaseProductGradePriceNotFoundException;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.mapper.ManualPriceMapper;
import com.aiatelye.leather.repository.PricingRuleRepository;
import com.aiatelye.leather.repository.ProductGradePriceRepository;
import com.aiatelye.leather.repository.ProductModelRepository;
import com.aiatelye.leather.cache.PriceCacheRepository;
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
    private final PriceCacheRepository priceCacheRepository;

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
        Map<Long, ProductGradePrice> priceMap = getPriceMap(productModelId, gradeIds);
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
                if (price == null) throw new BaseProductGradePriceNotFoundException("error.pricing.base-not-found", priceRequest.getGradeId());

                PricingRule rule = rulesMap.get(priceRequest.getCurrency());
                BigDecimal autoCalculated = calculatePriceService.calculateAutoPrice(price.getPrice(), rule);

                // Manual qiyməti set edirik
                if (priceRequest.getCurrency() == Enums.Currency.USD) {
                    price.setManualUsd(priceRequest.getManualPrice());

                    priceCacheRepository.savaPrice(
                            productModelId,
                            priceRequest.getGradeId(),
                            Enums.Currency.USD.name(),
                            priceRequest.getManualPrice());

                    log.info("Manual USD price cached for Product: {} | Grade: {} | Amount: {}",
                            productModelId, priceRequest.getGradeId(), priceRequest.getManualPrice());
                } else {
                    price.setManualEur(priceRequest.getManualPrice());

                    priceCacheRepository.savaPrice(
                            productModelId,
                            priceRequest.getGradeId(),
                            Enums.Currency.EUR.name(),
                            priceRequest.getManualPrice());

                    log.info("Manual EUR price cached for Product: {} | Grade: {} | Amount: {}",
                            productModelId, priceRequest.getGradeId(), priceRequest.getManualPrice());
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

        // 6. Builder ilə Response
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

        Map<Enums.Currency, PricingRule> rulesMap = getRulesMap();

        List<ProductGradePrice> prices = productGradePriceRepository.findByProductModelId(productModelId);
        List<ManualPriceResponse> responses = new ArrayList<>();

        for (ProductGradePrice price : prices) {
            // DÜZƏLİŞ 1: USD üçün listə əlavə etmək məntiqi artırıldı
            if (price.getManualUsd() != null) {
                PricingRule usdRule = rulesMap.get(Enums.Currency.USD);
                BigDecimal autoUsd = calculatePriceService.calculateAutoPrice(price.getPrice(), usdRule);

                responses.add(manualPriceMapper.toResponse(
                        price, Enums.Currency.USD, price.getManualUsd(), autoUsd
                ));
            }

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
                .errors(Collections.emptyList())
                .build();
    }

    @Transactional
    public ListManuelPricesResponse updateManualPrices(Long productModelId, ListCreateManualPricesRequest request) {
        log.info("Updating manual prices for product: {}", productModelId);

        ProductModel product = productModelRepository.findById(productModelId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productModelId));

        // DÜZƏLİŞ 2: Update prosesi N+1-dən qurtarıldı, DB-dən tək sorğu ilə məlumatlar RAM-a çəkildi
        List<Long> gradeIds = request.getManualPrices().stream()
                .map(CreateManualPriceRequest::getGradeId)
                .toList();

        Map<Long, ProductGradePrice> priceMap = getPriceMap(productModelId, gradeIds);
        Map<Enums.Currency, PricingRule> rulesMap = getRulesMap();

        List<ManualPriceResponse> successList = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        List<ProductGradePrice> pricesToUpdate = new ArrayList<>();

        for (CreateManualPriceRequest priceRequest : request.getManualPrices()) {
            try {
                if (priceRequest.getCurrency() == Enums.Currency.AZN) {
                    errors.add("Grade " + priceRequest.getGradeId() + ": Cannot set manual price for base currency (AZN)");
                    continue;
                }

                // Bazaya getmirik, Map-dən tapırıq
                ProductGradePrice price = priceMap.get(priceRequest.getGradeId());
                if (price == null) throw new BaseProductGradePriceNotFoundException("error.pricing.base-not-set");

                BigDecimal oldManual = (priceRequest.getCurrency() == Enums.Currency.USD) ? price.getManualUsd() : price.getManualEur();

                if (priceRequest.getCurrency() == Enums.Currency.USD) {
                    price.setManualUsd(priceRequest.getManualPrice());
                    priceCacheRepository.deletePrice(productModelId, priceRequest.getGradeId(), Enums.Currency.USD.name());
                    log.info("delete Cache  old ManuelPrice USD prodcutmodel ID {} grade id {}", productModelId, priceRequest.getGradeId());
                } else {
                    price.setManualEur(priceRequest.getManualPrice());
                    priceCacheRepository.deletePrice(productModelId, priceRequest.getGradeId(), Enums.Currency.EUR.name());
                    log.info("delete Cache  old ManuelPrice EUR productmodel ID {} grade id {}", productModelId, priceRequest.getGradeId());
                }

                PricingRule rule = rulesMap.get(priceRequest.getCurrency());
                BigDecimal autoCalculated = calculatePriceService.calculateAutoPrice(price.getPrice(), rule);

                ManualPriceResponse response = manualPriceMapper.toResponse(
                        price, priceRequest.getCurrency(), priceRequest.getManualPrice(), autoCalculated
                );

                pricesToUpdate.add(price);
                successList.add(response);

                log.info("Manual price updated: {} {} -> {} for grade {}",
                        priceRequest.getCurrency(), oldManual, priceRequest.getManualPrice(), priceRequest.getGradeId());

            } catch (Exception e) {
                log.error("Error processing price for grade {}: {}", priceRequest.getGradeId(), e.getMessage());
                errors.add("Grade " + priceRequest.getGradeId() + ": " + e.getMessage());
            }
        }

        // Bütün məlumatlar sonda bir dəfəyə DB-yə yazılır
        if (!pricesToUpdate.isEmpty()) {
            productGradePriceRepository.saveAll(pricesToUpdate);
        }

        return buildBatchResponse(
                productModelId,
                product.getModelname(),
                successList, errors,
                request.getManualPrices().size());
    }

    private ListManuelPricesResponse buildBatchResponse(Long id, String name, List<ManualPriceResponse> success, List<String> errors, int total) {
        return ListManuelPricesResponse.builder()
                .productModelId(id)
                .productModelName(name)
                .manualPrices(success)
                .totalCount(total)
                .successCount(success.size())
                .errors(errors)
                .build();
    }

    @Transactional
    public ListManuelPricesResponse deleteManualPrices(Long productModelId, ListDeleteManualPricesRequest request) {

        ProductModel product = productModelRepository.findById(productModelId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        Set<Long> gradeIds = request.getManualPrices()
                .stream()
                .map(DeleteManualPriceRequest::getGradeId)
                .collect(Collectors.toSet());

        Map<Long, ProductGradePrice> priceMap = getPriceMap(productModelId, gradeIds);
        Map<Enums.Currency, PricingRule> rulesMap = getRulesMap();

        List<ManualPriceResponse> deletedList = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        List<ProductGradePrice> toUpdate = new ArrayList<>();

        for (DeleteManualPriceRequest req : request.getManualPrices()) {
            try {
                processSingleDelete(req, priceMap, rulesMap, deletedList, toUpdate);

                priceCacheRepository.invalidateManuelPrices(productModelId, req.getGradeId());
                log.info("delete Cache  old ManuelPrice USD and EUR at deleteManualPrices  prodcutmodel ID {} grade id {}",
                        productModelId, req.getGradeId());

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
                .successCount(deletedList.size())
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

        if (req.getCurrency() == Enums.Currency.USD) price.setManualUsd(null);
        else price.setManualEur(null);

        PricingRule rule = rulesMap.get(req.getCurrency());
        BigDecimal autoPrice = calculatePriceService.calculateAutoPrice(price.getPrice(), rule);

        toUpdate.add(price);
        successList.add(manualPriceMapper.toResponse(price, req.getCurrency(), null, autoPrice));
    }

    // DÜZƏLİŞ 3: Universal getPriceMap - Collection qəbul edir, həm Set, həm List ilə işləyir və Key olaraq HƏMİŞƏ GradeId qaytarır
    private Map<Long, ProductGradePrice> getPriceMap(Long productId, Collection<Long> gradeIds) {
        return productGradePriceRepository.findByProductModelIdAndGradeIdIn(productId, gradeIds)
                .stream()
                .collect(Collectors.toMap(
                        p -> p.getGrade().getId(),
                        p -> p
                ));
    }

    private Map<Enums.Currency, PricingRule> getRulesMap() {
        return pricingRuleRepository.findAllByIsActiveTrue()
                .stream()
                .collect(Collectors.toMap(PricingRule::getTargetCurrency, r -> r));
    }
}