package com.aiatelye.leather.service.design;

import com.aiatelye.leather.dto.AiDesinger.GenerateDesignRequest;
import com.aiatelye.leather.enums.Enums;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@Slf4j
public class HashGenerationService {

    // STANDART DIZAYN - Cache-lənən
    // ==========================================

    /**
     * Standart dizaynlar üçün PURE MD5 hash yaradır.
     * Redis key formatı: "design:completed:" + hash (DesignCacheRepository tərəfindən əlavə edilir)
     */

    public String generateStandardCacheKey(GenerateDesignRequest request, String normalizedText) {
        StringBuilder keyBuilder = new StringBuilder();

        // Məcburi sahələr (həmişə var)
        keyBuilder.append("m:").append(request.getProductModelId());  // "m:" = qısa "model:"
        keyBuilder.append("|l:").append(request.getLeatherId());      // "l:" = qısa "leather:"

        // Opsional sahələr (sıra ilə)
        if (request.getGender() != null) {
            keyBuilder.append("|g:").append(request.getGender().name().charAt(0)); // "M" və ya "F"
        }
        if (request.getCategory() != null) {
            keyBuilder.append("|c:").append(request.getCategory().name().toLowerCase());
        }
        if (hasValue(request.getIconId())) {
            keyBuilder.append("|i:").append(request.getIconId().trim());
        }
        if (hasValue(request.getPlacementType())) {
            keyBuilder.append("|p:").append(request.getPlacementType().trim().toLowerCase());
        }
        if (hasValue(normalizedText)) {
            keyBuilder.append("|t:").append(normalizedText);
        }

        String rawString = keyBuilder.toString();
        String md5Hash = DigestUtils.md5DigestAsHex(rawString.getBytes(StandardCharsets.UTF_8));

        log.debug("Standard cache key generated: raw={}, hash={}", rawString, md5Hash);

        return md5Hash; // YALNIZ MD5, prefix yox! (32 simvol)
        // Nəticə: "e4d909c290d0fb1ca068ffaddf22cbd0"
    }

    // ==========================================
    // CUSTOM DIZAYN - Cache-lənməyən (UUID)
    // ==========================================

    /**
     * Custom dizaynlar üçün UNIKAL UUID yaradır.
     * Redis key formatı: "design:generating:custom:550e8400-..."
     */
    public String generateCustomCacheKey() {
        String uuid = "custom:" + UUID.randomUUID().toString();
        log.debug("Custom cache key generated: {}", uuid);
        return uuid; // Nəticə: "custom:550e8400-e29b-41d4-a716-446655440000"
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private boolean hasValue(String text) {
        return text != null && !text.trim().isEmpty();
    }

    /**
     * Hash-in valid olub-olmadığını yoxla (format check)
     */
    public boolean isValidHash(String hash) {
        return hash != null && hash.matches("^[a-f0-9]{32}$"); // 32 hex character
    }

    /**
     * Cache key-in tipini təyin et (standard vs custom)
     */
    public Enums.CacheKeyType determineKeyType(String cacheKey) {
        if (cacheKey == null) return Enums.CacheKeyType.UNKNOWN;
        if (cacheKey.startsWith("custom:")) return Enums.CacheKeyType.CUSTOM;
        if (cacheKey.matches("^[a-f0-9]{32}$")) return Enums.CacheKeyType.STANDARD;
        return Enums.CacheKeyType.UNKNOWN;
    }


}
