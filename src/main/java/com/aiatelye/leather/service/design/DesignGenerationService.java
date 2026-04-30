package com.aiatelye.leather.service.design;

import com.aiatelye.leather.cache.DesignCacheRepository;
import com.aiatelye.leather.dao.*;
import com.aiatelye.leather.dto.AiDesinger.CatalogDesignResponse;
import com.aiatelye.leather.dto.AiDesinger.DesignResponse;
import com.aiatelye.leather.dto.AiDesinger.GenerateDesignRequest;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.dto.AiDesinger.MyDesignsResponse;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.error.Exception.*;
import com.aiatelye.leather.mapper.AiCatalogMapper;
import com.aiatelye.leather.mapper.DesignMapper;
import com.aiatelye.leather.repository.*;
import com.aiatelye.leather.service.Minio.AIMinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignGenerationService {


    private final DesignPersistenceService persistenceService; // Yeni Servisi Bura Qoşuruq!
    private final CustomDesignRepository customDesignRepository;
    private final ProductModelRepository productModelRepository;
    private final LeatherRepository leatherRepository;
    private final DesignCacheRepository designCacheRepository;
    private final HashGenerationService hashService;
    private final DesignMapper designMapper;
    private final AIMinioService aiMinioService;
    private final AiCatalogMapper aiCatalogMapper;
    private final UserRepository userRepository;
    private  final UserLimitRepository userLimitRepository;


      public DesignResponse   generateDesign(Long userId, GenerateDesignRequest request) {
        UserLimit userLimit = getOrCreateAndResetLimit(userId);

        if (request.isCustomRequest()) {
            return handleCustomDesign(userId, request, userLimit);
        }
        return handleStandardDesign(userId, request, userLimit);
    }


    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public UserLimit getOrCreateAndResetLimit(Long userId) {

        Optional<UserLimit> optionalLimit = userLimitRepository.findByUserId(userId);

        if (optionalLimit.isPresent()) {
            return optionalLimit.get();
        }

        // LİMİT YOXDURSA YENİSİNİ YARADIRIQ

        User user =userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("İstifadəçi tapılmadı: " + userId));

        UserLimit newLimit = new UserLimit();
        newLimit.setUser(user);

        return userLimitRepository.save(newLimit);
    }



    // ==========================================
    // CUSTOM DESIGN (Limitli, birbaşa API)
    // ==========================================
    private DesignResponse handleCustomDesign(Long userId, GenerateDesignRequest request, UserLimit userLimit) {
        // : Limit yoxlanışı
        if (userLimit.getUsedTodayCount() >= userLimit.getDailyCustomLimit()) {
            throw new InsufficientQuotaException("{}"+ userLimit.getDailyCustomLimit());
        }

        ProductModel product = productModelRepository.findById(request.getProductModelId())
                .orElseThrow(() -> new NotFoundException("product Model not found"));
        Leather leather = leatherRepository.findById(request.getLeatherId())
                .orElseThrow(() -> new NotFoundException(" leather not found"));

        // : UUID-based cache key (prefix ilə)
        String uniqueCacheKey = hashService.generateCustomCacheKey();

        int maxRetries = 3;
        for (int i = 0; i < maxRetries; i++) {
            try {
                CustomDesigns design = persistenceService.saveCustomDesignAndPublish(
                        userId, request, product, leather, uniqueCacheKey);

                return DesignResponse.builder()
                        .designId(design.getId())
                        .status(Enums.DesignProcessStatus.GENERATING)
                        .message("Xüsusi dizaynınız hazırlanır. Təxmini vaxt: 20-30 saniyə.")
                        .estimatedSeconds(30)
                        .cacheKey(uniqueCacheKey)
                        .isCustom(true)
                        .dailyLimit(userLimit.getDailyCustomLimit())
                        .usedToday(userLimit.getUsedTodayCount() + 1)
                        .creditsRemaining(userLimit.getDailyCustomLimit() - userLimit.getUsedTodayCount() - 1)
                        .build();

            } catch (ObjectOptimisticLockingFailureException e) {
                log.warn("Custom design save failed, retry {}/{}", i + 1, maxRetries);
                if (i == maxRetries - 1) throw e;
                try {
                    Thread.sleep(100);
                } catch (InterruptedException ignored) {}
            }
        }
        throw new AiCustomDesingProssesingException("error design process-failed");
    }

    // ==========================================
    // STANDARD DESIGN (Cache-first, limitsiz)
    // ==========================================
    private DesignResponse handleStandardDesign(Long userId, GenerateDesignRequest request, UserLimit userLimit) {
        //  Limit yoxlanışı
        if (userLimit.getUsedStandardToday() >= userLimit.getDailyStandardLimit()) {
            throw new DailyUsageLimitException("Daily standard design limit is over");
        }

        String normalizedText = normalizeText(request.getUserText());

        //  Pure MD5 hash (prefix yox)
        String cacheKey = hashService.generateStandardCacheKey(request, normalizedText);

        // 1. REDIS CHECK (Cache Hit)
        DesignCacheRepository.CacheData cached = designCacheRepository.getCompletedDesign(cacheKey);
        if (cached != null) {
            log.info("Cache HIT for standard design: userId={}, hash={}", userId, cacheKey);

            return DesignResponse.builder()
                    .designId(cached.getDesignId())
                    .status(Enums.DesignProcessStatus.SUCCESS)
                    .renderImageUrl(cached.getRenderImageUrl())
                    .message("Dizayn hazırdır (cache)")
                    .isCustom(false)
                    .dailyLimit(userLimit.getDailyStandardLimit())
                    .usedToday(userLimit.getUsedStandardToday())
                    .creditsRemaining(userLimit.getDailyStandardLimit() - userLimit.getUsedStandardToday())
                    .build();
        }

        // 2. DB CHECK (DB Hit - populate cache)
        Optional<CustomDesigns> existing = customDesignRepository
                .findByCacheKeyAndRenderImageUrlIsNotNull(cacheKey);

        if (existing.isPresent()) {
            CustomDesigns design = existing.get();
            log.info("DB HIT for standard design: userId={}, designId={}, hash={}",
                    userId, design.getId(), cacheKey);

            //  Redis-ə populate et (userId ilə)
            designCacheRepository.saveCompletedDesign(
                    cacheKey,
                    design.getRenderImageUrl(),
                    design.getMinioObjectKey(),
                    design.getId(),
                    !design.isCustom(),
                    userId);

            return DesignResponse.builder()
                    .designId(design.getId())
                    .status(Enums.DesignProcessStatus.SUCCESS)
                    .renderImageUrl(design.getRenderImageUrl())
                    .message("Dizayn hazırdır (database)")
                    .isCustom(false)
                    .dailyLimit(userLimit.getDailyStandardLimit())
                    .usedToday(userLimit.getUsedStandardToday())
                    .creditsRemaining(userLimit.getDailyStandardLimit() - userLimit.getUsedStandardToday())
                    .build();
        }

        // 3. CACHE MISS - Yeni generasiya
        log.info("Cache MISS for standard design: userId={}, hash={}", userId, cacheKey);

        ProductModel product = productModelRepository.findById(request.getProductModelId())
                .orElseThrow(() -> new NotFoundException("error product not-found"));
        Leather leather = leatherRepository.findById(request.getLeatherId())
                .orElseThrow(() -> new NotFoundException("error leather not-found"));

        int maxRetries = 3;
        for (int i = 0; i < maxRetries; i++) {
            try {
                CustomDesigns design = persistenceService.saveStandardDesignAndPublish(
                        userId, request, product, leather, normalizedText, cacheKey);

                return DesignResponse.builder()
                        .designId(design.getId())
                        .status(Enums.DesignProcessStatus.GENERATING)
                        .message("Dizaynınız hazırlanır. Təxmini vaxt: 15 saniyə.")
                        .estimatedSeconds(15)
                        .cacheKey(cacheKey)
                        .isCustom(false)
                        .dailyLimit(userLimit.getDailyStandardLimit())
                        .usedToday(userLimit.getUsedStandardToday() + 1)
                        .creditsRemaining(userLimit.getDailyStandardLimit() - userLimit.getUsedStandardToday() - 1)
                        .build();

            } catch (ObjectOptimisticLockingFailureException e) {
                log.warn("Standard design save failed, retry {}/{}", i + 1, maxRetries);
                if (i == maxRetries - 1) throw e;
                try {
                    Thread.sleep(100);
                } catch (InterruptedException ignored) {}
            }
        }
        throw new AiStandardDesignProcessingException("error Standart design process failed");
    }

    private String normalizeText(String text) {
        if (text == null || text.trim().isEmpty()) return null;
        return text.trim().toLowerCase().replaceAll("\\s+", " ");
    }




    ///api/designs/me
    @Transactional(readOnly = true)
    public PageResponse<MyDesignsResponse> getMyDesigns(Long userId, int page, int size) {

        // Sadə pagination: createdAt DESC (ən yenilər əvvəldə)
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        // Yalnız userId ilə filter - başqa heç bir parameter yoxdur
        Page<CustomDesigns> designPage = customDesignRepository.findByUserId(userId, pageable);

        // Lazy Refresh: URL-ləri yoxla və yenilə
        designPage.getContent().forEach(this::refreshImageUrlIfNeeded);

        return designMapper.toMyDesignsPageResponse(designPage);


    }
    ///api/designs//catalog
    @Transactional(readOnly = true)
    public PageResponse<CatalogDesignResponse> getPublicCatalog(int page, int size, String sortBy) {

        // Sıralama seçimi
        Sort sort = createSort(sortBy);

        Pageable pageable = PageRequest.of(page, size, sort);

        // Yalnız PUBLIC və COMPLETED status olanlar
        Page<CustomDesigns> designPage = customDesignRepository.findByIsPublicTrueAndStatus(
                Enums.DesignProcessStatus.COMPLETED,
                pageable
        );

        // Lazy Refresh URL-ləri
        designPage.getContent().forEach(this::refreshImageUrlIfNeeded);

        return aiCatalogMapper.toCatalogPageResponse(designPage);
    }

    private Sort createSort(String sortBy) {
        if ("newest".equalsIgnoreCase(sortBy)) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        // Default: popular (hitCount)
        return Sort.by(Sort.Direction.DESC, "hitCount");
    }






    private void refreshImageUrlIfNeeded(CustomDesigns design) {
        if (design.getStatus().name().equals("COMPLETED") &&
                design.getRenderImageUrl() != null &&
                design.getMinioObjectKey() != null) {

            try {
                String freshUrl = aiMinioService.getPresignedUrl(
                        design.getMinioObjectKey()
                );
                design.setRenderImageUrl(freshUrl);
            } catch (Exception e) {
                log.warn("Failed to refresh URL for designId={}: {}", design.getId(), e.getMessage());
            }
        }
    }



}
