package com.aiatelye.leather.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Repository
@Slf4j
@RequiredArgsConstructor
public class LeatherCatalogCacheRepository {


    @Qualifier("LeatherCatalogCache") // Və ya "leatherCache" əlavə edin
    private final RedisTemplate<String, String> leatherCatalog_redisTemplate;

    private final ObjectMapper objectMapper;

    @Value("${cache.redis.leather.ttl}") // 10 dəqiqə default
    private Long ttlMinutes;

    @Value("${cache.redis.grade.ttl:60}") // 60 dəqiqə (grade-lər az dəyişir)
    private Long gradeTtlMinutes;

    // ==================== KEY PREFIX-lər ====================

    private static final String LEATHER_LIST_PREFIX = "leathers:list:"; // filter hash
    private static final String LEATHER_DETAIL_PREFIX = "leather:detail:";
    private static final String LEATHER_BY_GRADE_PREFIX = "leathers:grade:";
    private static final String GRADE_LIST_PREFIX = "grades:list";
    private static final String GRADE_DETAIL_PREFIX = "grade:detail:";

    // ==================== 1. GET /api/leathers (List) ====================

    /**
     * Filter-ə görə list keşlə
     * Key: leathers:list:{filterHash}:{page}:{currency}
     */
    public void cacheLeatherList(String filterKey, int page, String json) {
        try {
            String key = LEATHER_LIST_PREFIX + filterHash(filterKey) + ":" + page;
            leatherCatalog_redisTemplate.opsForValue().set(key, json, ttlMinutes, TimeUnit.MINUTES);
            log.info("Leather list cached: {}", key);
        } catch (Exception e) {
            log.error("Failed to cache leather list", e);
        }
    }

    public Optional<String> getLeatherList(String filterKey, int page) {
        try {
            String key = LEATHER_LIST_PREFIX + filterHash(filterKey) + ":" + page;
            String json = leatherCatalog_redisTemplate.opsForValue().get(key);

            // ✅ YENI: JSON var amma boş content varsa, cache miss say
            if (json != null && !json.trim().isEmpty()) {
                // Quick check: content array boşdurmu?
                if (json.contains("\"content\":[]") || json.contains("\"content\": []")) {
                    log.warn("Cache found but EMPTY content for key: {}", key);
                    // Boş cache-i sil ki, gələcəkdə yenidən yaranmasın
                    leatherCatalog_redisTemplate.delete(key);
                    return Optional.empty();
                }

                log.info("Leather list cache hit: {}", key);
                return Optional.of(json);
            }
        } catch (Exception e) {
            log.error("Failed to get leather list cache", e);
        }
        return Optional.empty();
    }

    // ==================== 2. GET /api/leathers/{id} (Detail) ====================

    /**
     * Dəri detalını keşlə
     * Key: leather:detail:{id}
     * TTL: Uzun (dəyişməz məlumatlar)
     */
    public void cacheLeatherDetail(Long leatherId, String json) {
        try {
            String key = LEATHER_DETAIL_PREFIX + leatherId;
           leatherCatalog_redisTemplate.opsForValue().set(key, json, ttlMinutes * 6, TimeUnit.MINUTES); // 1 saat
            log.info("Leather detail cached: {}", key);
        } catch (Exception e) {
            log.error("Failed to cache leather detail", e);
        }
    }

    public Optional<String> getLeatherDetail(Long leatherId) {
        try {
            String key = LEATHER_DETAIL_PREFIX + leatherId;
            String json =
            leatherCatalog_redisTemplate.opsForValue().get(key);
            if (json != null) {
                log.info("Leather detail cache hit: {}", key);
                return Optional.of(json);
            }
        } catch (Exception e) {
            log.error("Failed to get leather detail cache", e);
        }
        return Optional.empty();
    }

    // ==================== 3. GET /api/leathers/by-grade/{gradeType} ====================

    /**
     * Grade-ə görə dəriləri keşlə
     * Key: leathers:grade:{gradeType}:{page}
     */
    public void cacheLeathersByGrade(String gradeType, int page, String json) {
        try {
            String key = LEATHER_BY_GRADE_PREFIX + gradeType + ":" + page;
            leatherCatalog_redisTemplate.opsForValue().set(key, json, ttlMinutes, TimeUnit.MINUTES);
            log.info("Leathers by grade cached: {}", key);
        } catch (Exception e) {
            log.error("Failed to cache leathers by grade", e);
        }
    }

    public Optional<String> getLeathersByGrade(String gradeType, int page) {
        try {
            String key = LEATHER_BY_GRADE_PREFIX + gradeType + ":" + page;
            String json = leatherCatalog_redisTemplate.opsForValue().get(key);
            if (json != null) {
                log.info("Leathers by grade cache hit: {}", key);
                return Optional.of(json);
            }
        } catch (Exception e) {
            log.error("Failed to get leathers by grade cache", e);
        }
        return Optional.empty();
    }

    // ==================== 4. GET /api/grades (List) ====================

    /**
     * Bütün grade-ləri keşlə
     * Key: grades:list
     * TTL: Uzun (az dəyişir)
     */
    public void cacheGradeList(String json) {
        try {
            String key = GRADE_LIST_PREFIX;
            leatherCatalog_redisTemplate.opsForValue().set(key, json, gradeTtlMinutes, TimeUnit.MINUTES);
            log.info("Grade list cached");
        } catch (Exception e) {
            log.error("Failed to cache grade list", e);
        }
    }

    public Optional<String> getGradeList() {
        try {
            String json = leatherCatalog_redisTemplate.opsForValue().get(GRADE_LIST_PREFIX);
            if (json != null) {
                log.info("Grade list cache hit");
                return Optional.of(json);
            }
        } catch (Exception e) {
            log.error("Failed to get grade list cache", e);
        }
        return Optional.empty();
    }

    // ==================== 5. GET /api/grades/{id} (Detail) ====================

    /**
     * Grade detalını keşlə
     * Key: grade:detail:{id}
     */
    public void cacheGradeDetail(Long gradeId, String json) {
        try {
            String key = GRADE_DETAIL_PREFIX + gradeId;
           leatherCatalog_redisTemplate.opsForValue().set(key, json, gradeTtlMinutes, TimeUnit.MINUTES);
            log.info("Grade detail cached: {}", key);
        } catch (Exception e) {
            log.error("Failed to cache grade detail", e);
        }
    }

    public Optional<String> getGradeDetail(Long gradeId) {
        try {
            String key = GRADE_DETAIL_PREFIX + gradeId;
            String json = leatherCatalog_redisTemplate.opsForValue().get(key);
            if (json != null) {
                log.info("Grade detail cache hit: {}", key);
                return Optional.of(json);
            }
        } catch (Exception e) {
            log.error("Failed to get grade detail cache", e);
        }
        return Optional.empty();
    }

    // ==================== INVALIDATION (Admin üçün) ====================

    /**
     * Dəri dəyişəndə çağır

   /* public void invalidateLeatherDetail(Long leatherId) {
        String key = LEATHER_DETAIL_PREFIX + leatherId;
        leatherCatalog_redisTemplate.delete(key);
        log.info("Invalidated leather detail: {}", leatherId);
    }

    /**
     * Grade dəyişəndə çağır

    public void invalidateGradeDetail(Long gradeId) {
        String key = GRADE_DETAIL_PREFIX + gradeId;
        leatherCatalog_redisTemplate.delete(key);

        // Grade list də təmizlənməlidir (say dəyişə bilər)
       leatherCatalog_redisTemplate.delete(GRADE_LIST_PREFIX);

        log.info("Invalidated grade detail and list: {}", gradeId);
    }

    /**
     * Yeni dəri əlavə olunduqda çağır

    public void invalidateAllLeatherLists() {
        Set<String> keys =leatherCatalog_redisTemplate.keys(LEATHER_LIST_PREFIX + "*");
        if (!keys.isEmpty()) {
            leatherCatalog_redisTemplate.delete(keys);
            log.info("Invalidated {} leather list caches", keys.size());
        }
    }

    /**
     * Grade-ə görə keşləri təmizlə

    public void invalidateLeathersByGrade(String gradeType) {
        Set<String> keys = leatherCatalog_redisTemplate.keys(LEATHER_BY_GRADE_PREFIX + gradeType + ":*");
        if (!keys.isEmpty()) {
            leatherCatalog_redisTemplate.delete(keys);
            log.info("Invalidated leathers by grade: {}", gradeType);
        }
    }*/

    // ==================== PRIVATE HELPERS ====================

    private String filterHash(String filterKey) {
        // Filter parametrlərini hash-lə (çox uzun olmasın deyə)
        if (filterKey == null || filterKey.isBlank()) return "empty";
        return String.valueOf(filterKey.hashCode());
    }


    public void invalidateAll() {
        // Leather list-lər
        Set<String> leatherListKeys = leatherCatalog_redisTemplate.keys(LEATHER_LIST_PREFIX + "*");
        if (!leatherListKeys.isEmpty()) {
            leatherCatalog_redisTemplate.delete(leatherListKeys);
        }

        // Leather detail-lər
        Set<String> leatherDetailKeys = leatherCatalog_redisTemplate.keys(LEATHER_DETAIL_PREFIX + "*");
        if (!leatherDetailKeys.isEmpty()) {
            leatherCatalog_redisTemplate.delete(leatherDetailKeys);
        }

        // Grade by grade
        Set<String> gradeKeys = leatherCatalog_redisTemplate.keys(LEATHER_BY_GRADE_PREFIX + "*");
        if (!gradeKeys.isEmpty()) {
            leatherCatalog_redisTemplate.delete(gradeKeys);
        }

        // Grade list
        leatherCatalog_redisTemplate.delete(GRADE_LIST_PREFIX);

        // Grade detail-lər
        Set<String> gradeDetailKeys = leatherCatalog_redisTemplate.keys(GRADE_DETAIL_PREFIX + "*");
        if (!gradeDetailKeys.isEmpty()) {
            leatherCatalog_redisTemplate.delete(gradeDetailKeys);
        }

        log.info("All leather and grade caches invalidated");


    }
}
