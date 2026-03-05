package com.aiatelye.leather.service.pricing;

import com.aiatelye.leather.Specification.ProductGradePriceSpecification;
import com.aiatelye.leather.dao.LeatherGrade;
import com.aiatelye.leather.dao.PricingRule;
import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.admin.price.AdminCalculatedPriceResponse;
import com.aiatelye.leather.dto.admin.price.product.*;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.error.Exception.BadRequestException;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.mapper.ProductGradePriceMapper;
import com.aiatelye.leather.repository.LeatherGradeRepository;
import com.aiatelye.leather.repository.PricingRuleRepository;
import com.aiatelye.leather.repository.ProductGradePriceRepository;
import com.aiatelye.leather.repository.ProductModelRepository;
import com.aiatelye.leather.cache.PriceCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductPriceService {
    private final ProductGradePriceRepository priceGradePriceRepository;
    private final ProductModelRepository productModelRepository;
    private final LeatherGradeRepository gradeRepository;
    private final ProductGradePriceMapper productGradePriceMapper;
    private  final PriceCacheRepository priceCacheRepository;
    private  final PricingRuleRepository pricingRuleRepository;
    private  final  CalculatePriceService calculatePriceService;



    @Transactional(readOnly = true)
    public PageResponse<ProductPriceResponse> getPrices(ProductPriceFilter filter, Pageable pageable) {
        log.info("Fetching prices with filter: {}, page: {}", filter, pageable);

        // Boş filter yoxlama
        boolean isEmptyFilter = ProductGradePriceSpecification.isEmptyFilter(filter);
        if (isEmptyFilter) {
            log.info("Empty filter - returning all prices");
        }

        // Specification ilə filter + EntityGraph ilə N+1 həlli
        Page<ProductGradePrice> pricePage = priceGradePriceRepository.findAll(
                ProductGradePriceSpecification.withFilter(filter),
                pageable
        );

        // Map to response
        List<ProductPriceResponse> content = pricePage.getContent().stream()
                .map(productGradePriceMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<ProductPriceResponse>builder()
                .content(content)
                .pageNumber(pricePage.getNumber())
                .pageSize(pricePage.getSize())
                .totalElements(pricePage.getTotalElements())
                .totalPages(pricePage.getTotalPages())
                .last(pricePage.isLast())
                .build();
    }





    @Transactional
    public ListProductPriceResponse createProductPrices(Long productModelId, ListCreateProductPricesRequest request) {

        log.info("Batch price creation started for product: {}. Entry count: {}", productModelId, request.getPrices().size());

        ProductModel product = fetchActiveProduct(productModelId);

        // 2. Data Fetching (Batch - N+1 problemini aradan qaldırırıq)
        Set<Long> requestedGradeIds = request.getPrices().stream()
                .map(CreateProductPriceRequest::getGradeId)
                .collect(Collectors.toSet());

        Map<Long, LeatherGrade> gradeMap = fetchRequiredGrades(requestedGradeIds);
        Set<Long> existingGradeIds = priceGradePriceRepository.findAllGradeIdsByProductModelId(productModelId);

        log.debug("Data pre-fetched | Grades found: {} | Existing prices: {}", gradeMap.size(), existingGradeIds.size());

        List<ProductPriceResponse> successList = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        List<ProductGradePrice> entitiesToSave = new ArrayList<>();

        // 3. Biznes Məntiqi (Validasiya O(1) sürəti ilə RAM-da baş verir)
        for (CreateProductPriceRequest priceRequest : request.getPrices()) {
            validateAndPrepareEntity(priceRequest, product, gradeMap, existingGradeIds, entitiesToSave, errors);
        }


        if (!entitiesToSave.isEmpty()) {
            log.info("Attempting to save {} new price entities for product: {}", entitiesToSave.size(), productModelId);
            saveAndInvalidateCache(entitiesToSave, productModelId, successList);
        }else log.warn("No valid price entities to save for product: {}", productModelId);

        log.info("Batch price creation complete. Success: {}, Errors: {}", successList.size(), errors.size());

        return buildFinalResponse(product, successList, errors, request.getPrices().size());
    }



    private ProductModel fetchActiveProduct(Long id) {
        ProductModel product = productModelRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new BadRequestException("Prices cannot be set for inactive product: " + id);
        }
        return product;
    }

    private Map<Long, LeatherGrade> fetchRequiredGrades(Set<Long> ids) {
        return gradeRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(LeatherGrade::getId, g -> g));
    }

    private void validateAndPrepareEntity(CreateProductPriceRequest req, ProductModel product,
                                          Map<Long, LeatherGrade> gradeMap, Set<Long> existingIds,
                                          List<ProductGradePrice> toSave, List<String> errors) {
        Long gId = req.getGradeId();

        // Duplicate yoxlaması (Set istifadə edərək)
        if (existingIds.contains(gId)) {
            errors.add("Grade " + gId + ": Price already exists");
            return;
        }

        // Grade mövcudluğu
        LeatherGrade grade = gradeMap.get(gId);
        if (grade == null) {
            errors.add("Grade " + gId + ": Grade data not found");
            return;
        }

        try {
            toSave.add(productGradePriceMapper.toProductGradePriceEntity(req, product, grade));
        } catch (Exception e) {
            errors.add("Grade " + gId + ": Mapping failed: " + e.getMessage());
        }
    }

    private void saveAndInvalidateCache(List<ProductGradePrice> entities, Long productId, List<ProductPriceResponse> successList) {
        // Toplu yadda saxla
        List<ProductGradePrice> saved = priceGradePriceRepository.saveAll(entities);
        log.info("Successfully persisted {} entities to DB", saved.size());

        saved.forEach(s -> {
            successList.add(productGradePriceMapper.toProductPriceResponse(s));

            try {

                priceCacheRepository.invalidateProductPrices(productId, s.getGrade().getId());
                log.debug("Invalidating cache for product: {} | grade: {}", productId, s.getGrade().getId());

                priceCacheRepository.savaPrice(productId, s.getGrade().getId(), Enums.Currency.AZN.name(), s.getPrice());

                log.debug("Save  cache for product: {} | grade: {}  |product: {} | grade: {} ",
                        productId, s.getGrade().getId(), Enums.Currency.AZN.name(), s.getPrice());
            }catch (Exception e){

                log.error("CRITICAL REDIS ERROR( at ProductPriceCreateCache )could not be cleared for Product: {}. Error: {}",
                        productId, e.getMessage());
            }
        });
    }

    private ListProductPriceResponse buildFinalResponse(ProductModel product, List<ProductPriceResponse> success,
                                                        List<String> errors, int total) {
        return ListProductPriceResponse.builder()
                .productModelId(product.getId())
                .productModelName(product.getModelname())
                .prices(success)
                .totalCount(total)
                .successCount(success.size())
                .errors(errors)
                .build();
    }
    @Transactional(readOnly = true)
    public ListProductPriceResponse getProductPrices(Long productModelId) {

       log.info("Fetching  prices for proudct {} ",productModelId);

        ProductModel product = productModelRepository.findById(productModelId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productModelId));

        List<ProductGradePrice> prices = priceGradePriceRepository.
                findByProductModelIdOrderByGradeGradeLevelAsc(productModelId);

        List<ProductPriceResponse> responses =prices.stream()
                .map(productGradePriceMapper::toProductPriceResponse).collect(Collectors.toList());

        ListProductPriceResponse response = new ListProductPriceResponse();
        response.setProductModelId(productModelId);
        response.setProductModelName(product.getModelname());
        response.setPrices(responses);
        response.setTotalCount(responses.size());
        response.setSuccessCount(responses.size());
        response.setErrors(new ArrayList<>());

        return response;
    }


    @Transactional
    public ProductPriceResponse updateProductPrice(Long productModelId, Long gradeId, UpdateProductPriceRequest request) {
        log.info("Updating price for product: {}, grade: {}", productModelId, gradeId);

        ProductGradePrice price = priceGradePriceRepository.findByProductModelIdAndGradeId(productModelId, gradeId)
                .orElseThrow(() -> new NotFoundException("Price not found for product: " + productModelId + " and grade: " + gradeId));
        BigDecimal oldPrice = price.getPrice();
        price.setPrice(request.getPrice());
        price.setUpdatedAt(java.time.LocalDateTime.now());

        ProductGradePrice updated = priceGradePriceRepository.save(price);

        log.info("Price updated: {} -> {} for product: {}, grade: {}",
                oldPrice, request.getPrice(), productModelId, gradeId);

        try {

            priceCacheRepository.invalidateProductPrices(
                    updated.getId(),
                    updated.getGrade().getId());

            log.debug("Invalidating cache for product at Update of ProductPrice: {} | grade: {}",
                    updated.getId(), updated.getGrade().getId());

            priceCacheRepository.savaPrice(
                    updated.getId(),
                    updated.getGrade().getId(),
                    Enums.Currency.AZN.name(),
                    updated.getPrice());

            log.debug("Save  cache for product Update of ProductPrice : {} | grade: {}  |product: {} | grade: {} ",
                    updated.getId(), updated.getGrade().getId(), Enums.Currency.AZN.name(), updated.getPrice());
        }catch (Exception e){

            log.error("CRITICAL REDIS ERROR( at UpdatePriceCreateCache ) could not be cleared for Product: {}. Error: {}",
                    updated.getId(),e.getMessage());
        }
        return productGradePriceMapper.toProductPriceResponse(updated);
    }

    @Transactional
    public void deleteProductPrice(Long productModelId, Long gradeId) {
        log.info("Deleting price for product: {}, grade: {}", productModelId, gradeId);

        ProductGradePrice price = priceGradePriceRepository.findByProductModelIdAndGradeId(productModelId, gradeId)
                .orElseThrow(() -> new NotFoundException("Price not found for product: " + productModelId + " and grade: " + gradeId));

        priceGradePriceRepository.delete(price);

        log.info("Price deleted for product: {}, grade: {}", productModelId, gradeId);

        try {
            priceCacheRepository.invalidateProductPrices(productModelId, gradeId);
            log.info("Redis cache cleared successfully.");
        } catch (Exception e) {
            // 1. Loqlama: Adminin server loqlarında görməsi üçün
            log.error("CRITICAL REDIS ERROR (at deleteProductPrice) : Cache could not be cleared for Product: {}. Error: {}",
                    productModelId, e.getMessage());
        }

    }

    @Transactional(readOnly = true)
    public AdminCalculatedPriceResponse getCalculatedPrices(Long productId) {
        log.info("Admin fetching calculated prices for product: {}", productId);

        // 1. Proyeksiya istifadə edərək yalnız adı çəkirik (Performans++)

        String productName = productModelRepository.findModelNameById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productId));

        // 2. FETCH JOIN ilə N+1 problemini həll edirik (Repository-də @Query lazımdır)
        List<ProductGradePrice> gradePrices = priceGradePriceRepository.findAllByProductModelIdWithGrade(productId);

        // 3. Aktiv qaydaları Map-ə yığırıq
        Map<Enums.Currency, PricingRule> rulesMap = pricingRuleRepository.findAllByIsActiveTrue()
                .stream()
                .collect(Collectors.toMap(PricingRule::getTargetCurrency, r -> r));

        // 4. Hesablama zənciri
        List<AdminCalculatedPriceResponse.GradePriceDetail> gradeDetails = gradePrices.stream()
                .map(gp -> buildGradeDetail(gp, rulesMap))
                .collect(Collectors.toList());

        return AdminCalculatedPriceResponse.builder()
                .productId(productId)
                .productName(productName)
                .grades(gradeDetails)
                .build();
    }

    private AdminCalculatedPriceResponse.GradePriceDetail buildGradeDetail(
            ProductGradePrice gp,
            Map<Enums.Currency, PricingRule> rulesMap) {

        BigDecimal baseAzn = gp.getPrice();
        var grade = gp.getGrade(); // Artıq fetch olunub, sürətlidir.

        return AdminCalculatedPriceResponse.GradePriceDetail.builder()
                .gradeId(grade.getId())
                .gradeType(grade.getGradename().name())
                .azn(buildPriceDetail(baseAzn, Enums.Currency.AZN, "BASE", null))
                .usd(calculateAndBuildDetail(baseAzn, Enums.Currency.USD, gp.getManualUsd(), rulesMap.get(Enums.Currency.USD)))
                .eur(calculateAndBuildDetail(baseAzn, Enums.Currency.EUR, gp.getManualEur(), rulesMap.get(Enums.Currency.EUR)))
                .build();
    }

    private AdminCalculatedPriceResponse.PriceDetail calculateAndBuildDetail(
            BigDecimal baseAzn, Enums.Currency curr, BigDecimal manualPrice, PricingRule rule) {

        BigDecimal amount = manualPrice != null ? manualPrice :
                calculatePriceService.calculateAutoPrice(baseAzn, rule);

        return buildPriceDetail(amount, curr, manualPrice != null ? "MANUAL" : "AUTO", rule);
    }

    private AdminCalculatedPriceResponse.PriceDetail buildPriceDetail(
            BigDecimal amount, Enums.Currency currency, String source, PricingRule rule) {

        // String.format yerinə daha performanslı concatenation
        String formula = ("AUTO".equals(source) && rule != null)
                ? rule.getMultiplier() + "x + " + rule.getFixedAmount() + (rule.getRoundTo99() ? ", .99" : "")
                : null;

        return AdminCalculatedPriceResponse.PriceDetail.builder()
                .amount(amount)
                .source(source)
                .formula(formula)
                .ruleMultiplier(rule != null ? rule.getMultiplier() : null)
                .ruleFixed(rule != null ? rule.getFixedAmount() : null)
                .ruleRoundTo99(rule != null ? rule.getRoundTo99() : null)
                .build();
    }
}

