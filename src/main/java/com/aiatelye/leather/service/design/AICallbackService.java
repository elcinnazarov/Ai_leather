package com.aiatelye.leather.service.design;

import com.aiatelye.leather.cache.DesignCacheRepository;
import com.aiatelye.leather.dao.CustomDesigns;
import com.aiatelye.leather.dto.AiDesinger.AICallbackRequest;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.error.Exception.DesignNotFoundException;
import com.aiatelye.leather.repository.CustomDesignRepository;
import com.aiatelye.leather.service.Minio.AIMinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AICallbackService {


    private final CustomDesignRepository customDesignRepository;
    private final DesignCacheRepository designCacheRepository;
    private final AIMinioService aiMinioService;

    @Transactional
    public void processCallback(AICallbackRequest request) {
        log.info(" AI Callback received: designId={}, status={}, hasImage={}",
                request.getDesignId(),
                request.getStatus(),
                request.hasGeneratedImage());

        // 1. FAILED və ya şəkil yoxdursa
        if (!request.isSuccess()) {
            handleFailure(request);
            return;
        }

        // 2. DB-dən design tap
        CustomDesigns design = customDesignRepository.findById(request.getDesignId())
                .orElseThrow(() -> {
                    log.error(" Design not found: designId={}", request.getDesignId());
                    return new DesignNotFoundException("Design not found: " + request.getDesignId());
                });

        try {
            // 3. Şəkili MinIO-ya yüklə (YENI SERVICE)
            AIMinioService.AIImageUploadResult uploadResult = uploadImage(request);

            // 4. DB update
            updateDesignSuccess(design, uploadResult, request);

            // 5. Redis update (generating → completed)
            updateRedisCache(request, uploadResult, design);

            log.info(" AI Callback processed: designId={}, objectKey={}",
                    request.getDesignId(), uploadResult.getObjectKey());

        } catch (Exception e) {
            log.error(" Callback processing failed: designId={}", request.getDesignId(), e);
            handleFailure(request);
        }
    }

    // ==========================================
    // PRIVATE METHODS
    // ==========================================

    private AIMinioService.AIImageUploadResult uploadImage(AICallbackRequest request) {
        if (request.getGeneratedImageBase64() != null && !request.getGeneratedImageBase64().isEmpty()) {
            // Prioritet: Base64
            log.debug("Uploading Base64 image: designId={}", request.getDesignId());
            return aiMinioService.uploadGeneratedImage(
                    request.getGeneratedImageBase64(),
                    request.getDesignId(),
                    "png"
            );
        } else {
            // Alternativ: URL
            log.debug("Uploading from URL: designId={}, url={}",
                    request.getDesignId(), request.getGeneratedImageUrl());
            return aiMinioService.uploadFromUrl(
                    request.getGeneratedImageUrl(),
                    request.getDesignId()
            );
        }
    }

    private void updateDesignSuccess(CustomDesigns design, AIMinioService.AIImageUploadResult result,
                                     AICallbackRequest request) {
        design.setRenderImageUrl(result.getPresignedUrl());     // 1 saatlıq URL
        design.setMinioObjectKey(result.getObjectKey());        // Daimi key
        design.setStatus(Enums.DesignProcessStatus.COMPLETED);
        design.setPromptUsed(request.getPromptUsed());

        customDesignRepository.save(design);

        log.debug("💾 Design updated: designId={}, url={}", design.getId(), result.getPresignedUrl());
    }

    private void updateRedisCache(AICallbackRequest request, AIMinioService.AIImageUploadResult result,
                                  CustomDesigns design) {
        // Generating status sil
        designCacheRepository.removeGeneratingStatus(request.getCacheKey());

        // Completed status əlavə et
        designCacheRepository.saveCompletedDesign(
                request.getCacheKey(),
                result.getPresignedUrl(),    // Frontend üçün hazır URL
                result.getObjectKey(),       // Fallback üçün
                request.getDesignId(),
                !design.isCustom(),          // isPublic = !isCustom
                request.getUserId()
        );

        log.debug(" Redis updated: cacheKey={}", request.getCacheKey());
    }

    private void handleFailure(AICallbackRequest request) {
        // 1. DB status failed
        customDesignRepository.findById(request.getDesignId()).ifPresent(design -> {
            design.setStatus(Enums.DesignProcessStatus.FAILED);
            customDesignRepository.save(design);
            log.warn("⚠ Design marked FAILED: designId={}", request.getDesignId());
        });

        // 2. Redis təmizlə
        if (request.getCacheKey() != null) {
            designCacheRepository.removeGeneratingStatus(request.getCacheKey());
        }

        // 3. (Optional) User notification
        // notificationService.notifyDesignFailed(request.getUserId(), request.getDesignId());
    }
}
