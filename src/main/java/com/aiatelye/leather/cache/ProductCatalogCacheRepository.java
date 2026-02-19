package com.aiatelye.leather.cache;

import com.aiatelye.leather.dto.catalog.ProductCatalogResponse;
import com.aiatelye.leather.enums.Enums;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Repository
@Slf4j
@RequiredArgsConstructor
public class ProductCatalogCacheRepository {

    @Qualifier("productCatalogCache")
    private final RedisTemplate<String, String> redisTemplate_ProductCatalogCache;

    private final ObjectMapper objectMapper;

    @Value("${cache.redis.product-list.ttl}")
    private Long ttlMinutes;

    @Value("${cache.redis.product-detail.ttl}") // 24 saat
    private Long detailTtlMinutes;

    private static final String INITIAL_PAGE_PREFIX = "products:initial:page:0:";
    private static final String PRODUCT_DETAIL_PREFIX = "product:detail:";

    ///İlkin səhifəni yaddaşa yaz

    public void cacheInitialPage(ProductCatalogResponse response, Enums.Currency currency) {
        try {
            String key = INITIAL_PAGE_PREFIX + currency.name();
            String json = objectMapper.writeValueAsString(response);

            redisTemplate_ProductCatalogCache.opsForValue().set(key, json, ttlMinutes, TimeUnit.MINUTES);
            log.info("Initial page cached for {}: {} products", currency, response.getContent().size());
        } catch (Exception e) {
            log.error("Failed to cache initial page for {}", currency, e);
        }
    }

    public Optional<ProductCatalogResponse> getInitialPage(Enums.Currency currency) {
        try {
            String key = INITIAL_PAGE_PREFIX + currency.name();
            String json = redisTemplate_ProductCatalogCache.opsForValue().get(key);

            if (json != null) {
                log.info("Initial page cache hit for {}", currency);
                ProductCatalogResponse response = objectMapper.readValue(json, ProductCatalogResponse.class);
                return Optional.of(response);
            }
        } catch (Exception e) {
            log.error("Failed to read initial page cache for {}", currency, e);
        }
        return Optional.empty();
    }
    /// ProductDetail yaz
    public void cacheProductDetailByKey(String key, String json) {
        try {
            redisTemplate_ProductCatalogCache.opsForValue().set(key, json, detailTtlMinutes, TimeUnit.MINUTES);
            log.info("Product detail cached with key: {}", key);
        } catch (Exception e) {
            log.error("Failed to cache product detail with key: {}", key, e);
        }
    }
   /// ProductDetail oxu
    public Optional<String> getProductDetailByKey(String key) {
        try {
            String json = redisTemplate_ProductCatalogCache.opsForValue().get(key);
            if (json != null) {
                log.info("Product detail cache hit: {}", key);
                return Optional.of(json);
            }
        } catch (Exception e) {
            log.error("Failed to read product detail cache: {}", key, e);
        }
        return Optional.empty();
    }


    public void invalidateProductDetail(Long productId) {
        for (Enums.Currency currency : Enums.Currency.values()) {
            String key = PRODUCT_DETAIL_PREFIX + productId + ":" + currency.name();
            redisTemplate_ProductCatalogCache.delete(key);
        }
        log.info("Product detail caches invalidated for all currencies: {}", productId);
    }
   ///Bütün əsas səhifə keşlərini təmizlə

    public void invalidateAllInitialPages() {
        for (Enums.Currency currency : Enums.Currency.values()) {
            String key = INITIAL_PAGE_PREFIX + currency.name();
            redisTemplate_ProductCatalogCache.delete(key);
        }
        log.info("All initial page caches invalidated");
    }

}
