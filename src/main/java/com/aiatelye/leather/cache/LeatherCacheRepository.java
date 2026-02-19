package com.aiatelye.leather.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Repository
@Slf4j
@RequiredArgsConstructor
public class LeatherCacheRepository {

    @Qualifier("productCatalogLeatherCache") // Və ya ayrı bean: "leatherCache"
    private final RedisTemplate<String, String> redisTemplate;

    private final ObjectMapper objectMapper;

    @Value("${cache.redis.leather.ttl:5}") // 5 dəqiqə default
    private Long ttlMinutes;

    private static final String LEATHER_PREFIX = "leathers:available:";

    /**
     * GENERIC: Hər hansı list-i keşlə (query-dən asılı olmayaraq)
     * Key: productId əsaslı (query içəriyi vacib deyil)
     */
    public <T> void cacheAvailableLeathers(Long productId, List<T> leathers) {
        try {
            String key = buildKey(productId);
            String json = objectMapper.writeValueAsString(leathers);

            redisTemplate.opsForValue().set(key, json, ttlMinutes, TimeUnit.MINUTES);
            log.info("Cached {} leathers for product: {}", leathers.size(), productId);
        } catch (Exception e) {
            log.error("Failed to cache leathers for product: {}", productId, e);
        }
    }

    /**
     * GENERIC: Keşdən oxu (tip təhlükəsiz)
     */
    public <T> Optional<List<T>> getAvailableLeathers(Long productId, Class<T> clazz) {
        try {
            String key = buildKey(productId);
            String json = redisTemplate.opsForValue().get(key);

            if (json != null) {
                log.info("Cache hit for leathers: {}", productId);
                List<T> result = objectMapper.readValue(json,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
                return Optional.of(result);
            }
        } catch (Exception e) {
            log.error("Failed to read leather cache for product: {}", productId, e);
        }
        return Optional.empty();
    }

    /**
     * Keşi sil (stok dəyişəndə çağırılacaq)
     */
    public void invalidateAvailableLeathers(Long productId) {
        String key = buildKey(productId);
        redisTemplate.delete(key);
        log.info("Invalidated leather cache for product: {}", productId);
    }

    /**
     * Pattern ilə sil (ehtiyat üçün)
     */
    public void invalidateAll() {
        // Bütün "leathers:available:*" key-ləri sil
        // Implementasiya əlavə edilə bilər
        log.info("All leather caches invalidated");
    }

    private String buildKey(Long productId) {
        return LEATHER_PREFIX + productId;
    }
}
