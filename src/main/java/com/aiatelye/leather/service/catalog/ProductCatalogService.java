package com.aiatelye.leather.service.catalog;
import com.aiatelye.leather.Specification.ProductModelSpecification;
import com.aiatelye.leather.cache.LeatherCacheRepository;
import com.aiatelye.leather.cache.ProductCatalogCacheRepository;
import com.aiatelye.leather.config.infrastructure.CurrencyContext;
import com.aiatelye.leather.dao.CalculatedPrice;
import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.catalog.product.*;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.mapper.AvailableLeatherMapper;
import com.aiatelye.leather.mapper.ProductCatalogMapper;
import com.aiatelye.leather.mapper.ProductDetailMapper;
import com.aiatelye.leather.repository.LeatherRepository;
import com.aiatelye.leather.repository.ProductModelRepository;
import com.aiatelye.leather.service.pricing.CalculatePriceService;
import com.aiatelye.leather.service.pricing.PriceDisplayService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductCatalogService {

    private final ProductModelRepository productModelRepository;
    private final ProductCatalogMapper productMapper;
    private final PriceDisplayService priceDisplayService;
    private final ProductCatalogCacheRepository productCatalogCacheRepository;
    private final ProductDetailMapper productDetailMapper;
    private final CalculatePriceService calculatePriceService;
    private final ObjectMapper objectMapper;
    private  final AvailableLeatherMapper availableLeatherMapper;
    private final LeatherCacheRepository leatherCacheRepository;
    private  final LeatherRepository leatherRepository;


    @Transactional(readOnly = true)
    public ProductCatalogResponse getProductsSlice(ProductFilterRequest filter) {
        Enums.Currency currency = CurrencyContext.getCurrency(); // ThreadLocal-dan gəlir

        log.info("Fetching product catalog - page: {}, currency: {}", filter.getPage(), currency);

        // 1. Cache Hit check (İlkin səhifə optimizasiyası)
        if (isInitialPage(filter)) {
            return productCatalogCacheRepository.getInitialPage(currency)
                    .orElseGet(() -> fetchAndCacheInitialPage(filter, currency));
        }

        return fetchCatalogFromDb(filter, currency);
    }

    private ProductCatalogResponse fetchCatalogFromDb(ProductFilterRequest filter, Enums.Currency currency) {
        Pageable pageable = createPageable(filter);

        Page<ProductModel> productPage = productModelRepository.findAll(
                ProductModelSpecification.withFilter(filter),
                pageable
        );

        if (productPage.isEmpty()) {
            return buildEmptyResponse(productPage);
        }

        List<ProductModel> products = productPage.getContent();
        Map<Long, Long> cheapestGradeMap = fetchGradeMap(products);

        List<ProductCatalogResponse.ProductSummary> content = products.stream()
                .map(product -> enrichWithPrice(product, cheapestGradeMap.get(product.getId()), currency))
                .toList();

        return buildResponse(productPage, content);
    }

    private Map<Long, Long> fetchGradeMap(List<ProductModel> products) {
        List<Long> ids = products.stream().map(ProductModel::getId).toList();
        return productModelRepository.getCheapestGradeMap(ids);
    }

    private ProductCatalogResponse.ProductSummary enrichWithPrice(ProductModel product, Long gradeId, Enums.Currency currency) {
        ProductCatalogResponse.ProductSummary summary = productMapper.toSummary(product);

        if (gradeId != null) {
            var priceDetail = priceDisplayService.getQuickPrice(product.getId(), gradeId, currency);
            summary.setBasePrice(priceDetail.getAmount());
            summary.setFormattedPrice(priceDetail.getFormatted());
            summary.setCurrency(currency);
        } else {
            summary.setBasePrice(BigDecimal.ZERO);
            summary.setFormattedPrice("N/A");
            summary.setCurrency(currency);
        }
        return summary;
    }

    private ProductCatalogResponse fetchAndCacheInitialPage(ProductFilterRequest filter, Enums.Currency currency) {
        ProductCatalogResponse response = fetchCatalogFromDb(filter, currency);

        // 🔴 BUG: Həmişə cache yazır, hətta boş olanda da!
        // productCatalogCacheRepository.cacheInitialPage(response, currency);

        // 🟢 FIX: Yalnız dolu olanda cache et
        if (response.getContent() != null && !response.getContent().isEmpty()) {
            productCatalogCacheRepository.cacheInitialPage(response, currency);
        } else {
            log.warn("Initial page EMPTY for {}, skipping cache", currency);
        }

        return response;
    }

    private Pageable createPageable(ProductFilterRequest filter) {
        return PageRequest.of(
                filter.getPage(),
                filter.getSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );
    }

    private ProductCatalogResponse buildResponse(Page<ProductModel> page, List<ProductCatalogResponse.ProductSummary> content) {
        return ProductCatalogResponse.builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    private ProductCatalogResponse buildEmptyResponse(Page<ProductModel> page) {
        return buildResponse(page, Collections.emptyList());
    }

    private boolean isInitialPage(ProductFilterRequest filter) {
        return filter.getPage() == 0 && ProductModelSpecification.isEmptyFilter(filter);
    }


    @Transactional(readOnly = true)
    public ProductDetailResponse getProductDetail(Long productId) {
        Enums.Currency currentCurrency = CurrencyContext.getCurrency();
        String cacheKey = buildCacheKey(productId, currentCurrency);

        // 1. Redis Keşini yoxla
        Optional<String> cachedJson = productCatalogCacheRepository.getProductDetailByKey(cacheKey);
        if (cachedJson.isPresent()) {
            try {
                log.info("Cache hit: Returning product {} for {}", productId, currentCurrency);
                return objectMapper.readValue(cachedJson.get(), ProductDetailResponse.class);
            } catch (Exception e) {
                log.error("Failed to parse cached JSON for product {}", productId, e);
            }
        }

        // 2. Database-dən (N+1-siz) çək
        ProductModel product = productModelRepository.findByIdWithDetails(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        // 3. Mapping və Qiymət Zənginləşdirilməsi
        ProductDetailResponse response = productDetailMapper.toBaseResponse(product);
        response.setCurrentCurrency(currentCurrency);

        List<ProductDetailResponse.GradePriceSummary> gradePrices = product.getGradePrices().stream()
                .map(pgp -> buildGradePriceSummary(pgp, currentCurrency))
                .toList();
        response.setGradePrices(gradePrices);

        // 4. Nəticəni Redis-ə yaz (24 saatlıq)
        cacheResponse(cacheKey, response);

        return response;
    }

    /**
     * GET /api/products/{id}/prices
     * Bütün endpoint və bütün valyutalar üçün  cemi 9 qiymət verir
     */
    @Transactional(readOnly = true)
    public ProductPriceMatrixResponse getProductPriceMatrix(Long productId) {
        log.info("Fetching full price matrix for product: {}", productId);

        ProductModel product = productModelRepository.findByIdWithDetails(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        Map<String, ProductPriceMatrixResponse.GradePriceMatrix> matrix = product.getGradePrices().stream()
                .collect(Collectors.toMap(
                        pgp -> pgp.getGrade().getGradeType().name(),
                        this::buildGradePriceMatrix
                ));

        return ProductPriceMatrixResponse.builder()
                .productId(productId)
                .productName(product.getModelname())
                .matrix(matrix)
                .build();
    }

    // --- Köməkçi Metodlar (Helper Methods) ---

    private ProductDetailResponse.GradePriceSummary buildGradePriceSummary(
            ProductGradePrice pgp, Enums.Currency currency) {

        var priceDetail = priceDisplayService.getQuickPrice(
                pgp.getProductModel().getId(),
                pgp.getGrade().getId(),
                currency
        );

        return ProductDetailResponse.GradePriceSummary.builder()
                .gradeId(pgp.getGrade().getId())
                .gradeType(pgp.getGrade().getGradeType().name())
                .amount(priceDetail.getAmount())
                .formatted(priceDetail.getFormatted())
                .build();
    }

    private ProductPriceMatrixResponse.GradePriceMatrix buildGradePriceMatrix(ProductGradePrice pgp) {
        // Bütün valyuta kombinasiyalarını (AZN, USD, EUR) hesabla
        Map<Enums.Currency, CalculatedPrice> allCalculated =
                calculatePriceService.getAllCalculatedPrices(pgp.getProductModel().getId(), pgp.getGrade().getId());

        Map<Enums.Currency, ProductPriceMatrixResponse.PriceDetail> priceDetails = new EnumMap<>(Enums.Currency.class);

        allCalculated.forEach((curr, calc) ->
                priceDetails.put(curr, ProductPriceMatrixResponse.PriceDetail.builder()
                        .amount(calc.getAmount())
                        .formatted(formatPrice(calc.getAmount(), curr))
                        .source(calc.getSource())
                        .build())
        );

        return ProductPriceMatrixResponse.GradePriceMatrix.builder()
                .gradeId(pgp.getGrade().getId())
                .gradeType(pgp.getGrade().getGradeType().name())
                .prices(priceDetails)
                .build();
    }

    private void cacheResponse(String key, ProductDetailResponse response) {
        try {
            String json = objectMapper.writeValueAsString(response);
            productCatalogCacheRepository.cacheProductDetailByKey(key, json);
        } catch (Exception e) {
            log.error("Failed to serialize product detail for caching", e);
        }
    }

    private String buildCacheKey(Long productId, Enums.Currency currency) {
        return "product:detail:" + productId + ":" + currency.name();
    }

    private String formatPrice(BigDecimal amount, Enums.Currency currency) {
        String symbol = switch (currency) {
            case AZN -> "₼";
            case USD -> "$";
            case EUR -> "€";
        };
        return symbol + amount.setScale(2, RoundingMode.HALF_UP).toString();
    }


    @Transactional(readOnly = true)
    public List<P_AvailableLeatherResponse> getAvailableLeathers(Long productId) {
        log.info("Fetching available leathers for product: {}", productId);

        // 1. KEŞ YOXLA
        var cached = leatherCacheRepository.getAvailableLeathers(
                productId,
                P_AvailableLeatherResponse.class
        );

        if (cached.isPresent()) {
            log.info("Returning cached leathers for product: {}", productId);
            return cached.get();
        }

        // 2. Məhsulun mövcudluğunu yoxla
        ProductModel product = productModelRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productId));

        // 3. DATABASE-DƏN ÇƏK
        List<Leather> leathers = leatherRepository.findAvailableLeathersByProductId(productId);

        // 4. MAP ET
        List<P_AvailableLeatherResponse> response = availableLeatherMapper.toResponseList(leathers);

        // 5. KEŞLƏ (MÜDAFİƏ QATI: YALNIZ BOŞ DEYİLSƏ KEŞLƏ)
        if (response != null && !response.isEmpty()) {
            leatherCacheRepository.cacheAvailableLeathers(productId, response);
            log.info("Found and cached {} leathers for product: {}", response.size(), productId);
        } else {
            // Əgər bazadan boş gəldisə, Redis-ə YAZMA!
            // Növbəti dəfə sorğu gələndə məcbur yenə DB-yə baxsın.
            log.warn("No leathers found for product: {}. Skipping cache to prevent empty cache pollution.", productId);
        }

        return response;
    }
    /** bu kod gelcekde lazim ola biler
      Admin stok dəyişəndə çağırılacaq

    public void invalidateCache(Long productId) {
        leatherCacheRepository.invalidateAvailableLeathers(productId);
        log.info("Cache invalidated for product: {}", productId);
    }*/
}