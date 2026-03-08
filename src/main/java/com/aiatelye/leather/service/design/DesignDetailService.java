package com.aiatelye.leather.service.design;

import com.aiatelye.leather.cache.DesignCacheRepository;
import com.aiatelye.leather.componet.CurrentContext;
import com.aiatelye.leather.dao.CustomDesigns;
import com.aiatelye.leather.dto.AiDesinger.DesignDetailResponse;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.error.Exception.UnauthorizedException;
import com.aiatelye.leather.mapper.DesignDetailMapper;
import com.aiatelye.leather.repository.CustomDesignRepository;
import com.aiatelye.leather.service.Minio.AIMinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignDetailService {


    private final CustomDesignRepository customDesignRepository;
    private final DesignCacheRepository designCacheRepository;
    private final DesignDetailMapper designDetailMapper;
    private final CurrentContext currentContext;
    private final AIMinioService aiMinioService;

    @Transactional(readOnly = true)
    public DesignDetailResponse getDesignDetail(Long designId) {
        // 1. DB-dən dizaynı çək (user ilə birlikdə)
        CustomDesigns design = customDesignRepository.findByIdWithUserAndProductAndLeather(designId)
                .orElseThrow(() -> new NotFoundException("error.design.not-found"));

        // 2. Security Check - HYBRID MƏNTİQ
        boolean isPublic = design.isPublic();

        if (!isPublic) {
            // Private dizayn → yalnız sahibi və ya ADMIN görür
            Long currentUserId = currentContext.getCurrentUserId();
            Long ownerId = design.getUser().getId();
            boolean isOwner = Objects.equals(ownerId, currentUserId);
            boolean isAdmin = currentContext.hasRole("ADMIN");

            if (!isOwner && !isAdmin) {
                log.error("Səlahiyyətsiz giriş! User: {}, Owner: {}, Design: {}",
                        currentUserId, ownerId, designId);
                throw new UnauthorizedException("Bu dizayn private-dir və sizə aid deyil.");
            }
        }

        // Public dizayn → hər kəs görür (additional check yoxdur)

        // 3. Lazy Refresh - URL-i təzələ (həm public, həm private üçün)
        String renderImageUrl = getFreshRenderImageUrl(design);

        // 4. Response build et
        return designDetailMapper.toResponse(design, renderImageUrl);
    }

    /**
     * Cache-first + Lazy Refresh məntiqi
     */
    private String getFreshRenderImageUrl(CustomDesigns design) {
        String cacheKey = design.getCacheKey();
        String cachedUrl = getUrlFromCache(cacheKey);

        if (cachedUrl != null && !isUrlExpired(cachedUrl)) {
            log.debug("Cache hit with valid URL: designId={}", design.getId());
            return cachedUrl;
        }

        // Cache miss və ya URL expired → DB-dən yoxla
        String dbUrl = design.getRenderImageUrl();

        if (dbUrl != null && !isUrlExpired(dbUrl)) {
            // DB valid → cache-ə yaz və qaytar
            log.debug("DB URL valid, caching: designId={}", design.getId());
            populateCache(design, dbUrl);
            return dbUrl;
        }

        // Hər ikisi expired → MinIO-dan yeni URL al
        log.info("URL refresh required: designId={}", design.getId());
        return refreshUrlAndUpdate(design, cacheKey);
    }

    private String getUrlFromCache(String cacheKey) {
        DesignCacheRepository.CacheData cached = designCacheRepository.getCompletedDesign(cacheKey);
        return (cached != null) ? cached.getRenderImageUrl() : null;
    }

    private void populateCache(CustomDesigns design, String url) {
        designCacheRepository.saveCompletedDesign(
                design.getCacheKey(),
                url,
                design.getMinioObjectKey(),
                design.getId(),
                design.isPublic(),
                design.getUser().getId()
        );
    }

    /**
     * URL-in vaxtını yoxlayır
     */
    private boolean isUrlExpired(String url) {
        if (url == null) return true;

        try {
            Map<String, String> params = extractQueryParams(url);
            String amzDate = params.get("X-Amz-Date");
            String amzExpires = params.get("X-Amz-Expires");

            if (amzDate == null || amzExpires == null) {
                return true;
            }

            Instant creationTime = Instant.parse(amzDate);
            int expiresSeconds = Integer.parseInt(amzExpires);

            // 5 dəqiqə buffer
            Instant expirationTime = creationTime.plusSeconds(expiresSeconds - 300);

            return Instant.now().isAfter(expirationTime);

        } catch (Exception e) {
            log.warn("URL parse error, assuming expired: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Yeni URL yaradır və hər yerdə update edir
     */
    @Transactional
    protected String refreshUrlAndUpdate(CustomDesigns design, String cacheKey) {
        // MinIO-dan yeni URL (60 dəqiqə)
        String newUrl = aiMinioService.getPresignedUrl(design.getMinioObjectKey());

        // DB update
        design.setRenderImageUrl(newUrl);
        customDesignRepository.save(design);

        // Cache update
        designCacheRepository.invalidateCompletedDesign(cacheKey, design.getUser().getId());
        populateCache(design, newUrl);

        log.info("URL refreshed: designId={}, newExpiry={}",
                design.getId(), extractExpiryTime(newUrl));

        return newUrl;
    }

    private Map<String, String> extractQueryParams(String url) {
        Map<String, String> params = new HashMap<>();
        try {
            String query = new URL(url).getQuery();
            if (query != null) {
                for (String param : query.split("&")) {
                    String[] pair = param.split("=", 2);
                    if (pair.length == 2) {
                        params.put(pair[0], URLDecoder.decode(pair[1], StandardCharsets.UTF_8));
                    }
                }
            }
        } catch (Exception e) {
            log.error("URL parse error", e);
        }
        return params;
    }

    private String extractExpiryTime(String url) {
        try {
            Map<String, String> params = extractQueryParams(url);
            String amzDate = params.get("X-Amz-Date");
            if (amzDate != null) {
                Instant expiry = Instant.parse(amzDate).plusSeconds(3600);
                return expiry.toString();
            }
        } catch (Exception e) {
            log.warn("Could not extract expiry");
        }
        return "unknown";
    }
}
