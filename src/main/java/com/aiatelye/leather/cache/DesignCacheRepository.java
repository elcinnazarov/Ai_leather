package com.aiatelye.leather.cache;

import com.aiatelye.leather.dao.enums.Enums;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Repository
@RequiredArgsConstructor
public class DesignCacheRepository {

    @Qualifier("designCache")
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${cache.redis.design.ttl}")
    private long COMPLETED_TTL_SECONDS;

    @Value("${cache.redis.design.generating.ttl}")
    private long GENERATING_TTL_SECONDS;

    @Value("${cache.redis.design.popular}")
    private long POPULAR_TTL_SECONDS;

    // Prefixlər
    private static final String COMPLETED_PREFIX = "design:completed:";
    private static final String GENERATING_PREFIX = "design:generating:";
    private static final String POPULAR_PREFIX = "design:popular:";
    private static final String USER_DESIGNS_PREFIX = "design:user:"; //  ƏLAVƏ: User-specific tracking

    // ==========================================
    // COMPLETED Dizaynlar
    // ==========================================

    public void saveCompletedDesign(String hash, String renderImageUrl, String minioObjectKey,
                                    Long designId, boolean isPublic, Long userId) {
        String key = COMPLETED_PREFIX + hash;

        CacheData data = CacheData.builder()
                .designId(designId)
                .renderImageUrl(renderImageUrl)
                .minioObjectKey(minioObjectKey)
                .status(Enums.DesignProcessStatus.COMPLETED)
                .isPublic(isPublic)
                .userId(userId) //  ƏLAVƏ: User tracking üçün
                .build();

        try {
            String json = objectMapper.writeValueAsString(data);
            redisTemplate.opsForValue().set(key, json, COMPLETED_TTL_SECONDS, TimeUnit.SECONDS);

            //  ƏLAVƏ: User-in dizayn listinə əlavə et (SET strukturu)
            String userDesignsKey = USER_DESIGNS_PREFIX + userId;
            redisTemplate.opsForSet().add(userDesignsKey, key);
            redisTemplate.expire(userDesignsKey, COMPLETED_TTL_SECONDS, TimeUnit.SECONDS);

            log.info(" Design cached: hash={}, designId={}, userId={}", hash, designId, userId);
        } catch (JsonProcessingException e) {
            log.error(" Failed to cache design: hash={}", hash, e);
        }
    }

    public CacheData getCompletedDesign(String hash) {
        String key = COMPLETED_PREFIX + hash;
        String json = redisTemplate.opsForValue().get(key);

        if (json == null) {
            log.debug("Cache MISS: hash={}", hash);
            return null;
        }

        try {
            CacheData data = objectMapper.readValue(json, CacheData.class);
            log.info(" Cache HIT: hash={}, designId={}", hash, data.getDesignId());
            return data;
        } catch (JsonProcessingException e) {
            log.error(" Corrupted cache data: hash={}", hash, e);
            invalidateCompletedDesign(hash, null); // userId bilmirəm, amma əsas key silinir
            return null;
        }
    }

    // ==========================================
    // GENERATING Status
    // ==========================================

    public void saveGeneratingStatus(String hash, Long designId, Long userId) {
        String key = GENERATING_PREFIX + hash;

        GeneratingData data = GeneratingData.builder()
                .designId(designId)
                .userId(userId) //  ƏLAVƏ
                .status(Enums.DesignProcessStatus.GENERATING)
                .timestamp(System.currentTimeMillis())
                .build();

        try {
            String json = objectMapper.writeValueAsString(data);
            redisTemplate.opsForValue().set(key, json, GENERATING_TTL_SECONDS, TimeUnit.SECONDS);
            log.info(" Generating cached: hash={}, designId={}", hash, designId);
        } catch (JsonProcessingException e) {
            log.error(" Failed to cache generating: hash={}", hash, e);
        }
    }

    public GeneratingData getGeneratingStatus(String hash) {
        String key = GENERATING_PREFIX + hash;
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) return null;

        try {
            return objectMapper.readValue(json, GeneratingData.class);
        } catch (JsonProcessingException e) {
            log.error(" Corrupted generating data: hash={}", hash, e);
            removeGeneratingStatus(hash);
            return null;
        }
    }

    public void removeGeneratingStatus(String hash) {
        redisTemplate.delete(GENERATING_PREFIX + hash);
        log.info("🗑 Generating removed: hash={}", hash);
    }

    // ==========================================
    // WEBHOOK (n8n callback)
    // ==========================================

    public void markAsCompleted(String hash, String renderImageUrl, String minioObjectKey,
                                Long designId, boolean isPublic, Long userId) {
        removeGeneratingStatus(hash);
        saveCompletedDesign(hash, renderImageUrl, minioObjectKey, designId, isPublic, userId);
        log.info(" Marked completed: hash={}, designId={}", hash, designId);
    }

    // ==========================================
    // TƏHLÜKƏSİZ INVALIDATION (Düzəldilmiş!)
    // ==========================================

    /**
     * Tək dizaynı sil (əsas metod)
     */
    public void invalidateCompletedDesign(String hash, Long userId) {
        String key = COMPLETED_PREFIX + hash;

        // Əvvəlcə user set-dən sil
        if (userId != null) {
            String userDesignsKey = USER_DESIGNS_PREFIX + userId;
            redisTemplate.opsForSet().remove(userDesignsKey, key);
        }

        // Sonra əsas key-i sil
        redisTemplate.delete(key);
        log.info("🗑️ Design invalidated: hash={}", hash);
    }

    /**
     *  TƏHLÜKƏSİZ: User-in bütün dizaynlarını sil (KEYS əvəzinə SET istifadə!)
     */
    public void invalidateAllUserDesigns(Long userId) {
        String userDesignsKey = USER_DESIGNS_PREFIX + userId;

        // 1. User-in dizayn key-lərini al (SET-dən) - O(1) əməliyyat
        Set<String> userDesignKeys = redisTemplate.opsForSet().members(userDesignsKey);

        if (userDesignKeys == null || userDesignKeys.isEmpty()) {
            log.info("No cached designs for user: {}", userId);
            return;
        }

        // 2. Hər bir key-i sil (pipelined)
        List<String> keysToDelete = userDesignKeys.stream()
                .filter(key -> key != null && key.startsWith(COMPLETED_PREFIX))
                .collect(Collectors.toList());

        if (!keysToDelete.isEmpty()) {
            redisTemplate.delete(keysToDelete);
            log.info(" Deleted {} designs for user: {}", keysToDelete.size(), userId);
        }

        // 3. User set-ini də sil
        redisTemplate.delete(userDesignsKey);
    }

    /**
     *  ALTERNATIV: TTL-ə güvən (ən təhlükəsiz)
     * Heç bir şey silmə, vaxtı bitib özü silinsin
     */
    public void softInvalidateUserDesigns(Long userId) {
        // Heç bir şey etmə - Redis TTL özü siləcək
        log.info(" Designs will auto-expire for user: {} (TTL-based)", userId);
    }

    // ==========================================
    // MARKETPLACE (Populyar dizaynlar)
    // ==========================================

    public void savePopularDesigns(List<CacheData> designs) {
        String key = POPULAR_PREFIX + "top10";
        try {
            String json = objectMapper.writeValueAsString(designs);
            redisTemplate.opsForValue().set(key, json, POPULAR_TTL_SECONDS, TimeUnit.SECONDS);
            log.info(" Popular designs cached: {} items", designs.size());
        } catch (JsonProcessingException e) {
            log.error(" Failed to cache popular designs", e);
        }
    }

    public List<CacheData> getPopularDesigns() {
        String key = POPULAR_PREFIX + "top10";
        String json = redisTemplate.opsForValue().get(key);

        if (json == null) return null;

        try {
            List<CacheData> designs = objectMapper.readValue(json, new TypeReference<List<CacheData>>() {});
            log.info(" Popular designs cache hit: {} items", designs.size());
            return designs;
        } catch (JsonProcessingException e) {
            log.error(" Failed to parse popular designs", e);
            redisTemplate.delete(key);
            return null;
        }
    }

    // ==========================================
    // USER DESIGN LIST (Pagination üçün)
    // ==========================================

    /**
     * User-in dizayn ID-lərini səhifələmə ilə al
     */
    public Set<String> getUserDesignKeys(Long userId, int page, int size) {
        String userDesignsKey = USER_DESIGNS_PREFIX + userId;

        // Set-dən səhifələmə ilə al (Redis ZSET ilə daha yaxşı olar, amma SET də işləyir)
        Set<String> allKeys = redisTemplate.opsForSet().members(userDesignsKey);
        if (allKeys == null) return Set.of();

        return allKeys.stream()
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toSet());
    }

    // ==========================================
    // DATA CLASSES
    // ==========================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CacheData {
        private Long designId;
        private String renderImageUrl;
        private String minioObjectKey;
        private Enums.DesignProcessStatus status;
        private boolean isPublic;
        private Long userId; //  ƏLAVƏ: User tracking
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeneratingData {
        private Long designId;
        private Long userId; //  ƏLAVƏ
        private Enums.DesignProcessStatus status;
        private long timestamp;
    }
}
