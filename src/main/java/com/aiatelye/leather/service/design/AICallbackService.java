package com.aiatelye.leather.service.design;

import com.aiatelye.leather.cache.DesignCacheRepository;
import com.aiatelye.leather.dao.CustomDesigns;
import com.aiatelye.leather.dto.AiDesinger.AICallbackRequest;
import com.aiatelye.leather.dao.enums.Enums;
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
        log.info(" AI Callback received: designId={}, status={}",
                request.getDesignId(), request.getStatus());

        //  FAILED olubsa və ya minioObjectKey yoxdursa
        if (!request.isSuccess()) {
            handleFailure(request);
            return;
        }

        //  DB-dən design tap
        CustomDesigns design = customDesignRepository.findById(request.getDesignId())
                .orElseThrow(() -> {
                    log.error(" Design not found: designId={}", request.getDesignId());
                    return new DesignNotFoundException("Design not found: " + request.getDesignId());
                });

        try {
            //  ƏN BÖYÜK FƏRQ: Şəkil yükləmirik!
            // n8n şəkli artıq MinIO-ya yükləyib. Biz sadəcə o addan istifadə edib Frontend üçün vaxtlı link yaradırıq.
            String presignedUrl = aiMinioService.getPresignedUrl(request.getMinioObjectKey());

            // DB update
            updateDesignSuccess(design, presignedUrl, request);

            //  Redis update (generating -> completed)
            updateRedisCache(request, presignedUrl, design);

            log.info("AI Callback processed successfully: designId={}, objectKey={}",
                    request.getDesignId(), request.getMinioObjectKey());

        } catch (Exception e) {
            log.error(" Callback processing failed: designId={}", request.getDesignId(), e);
            handleFailure(request);
        }
    }

    // PRIVATE METHODS (YALNIZ DB VƏ REDIS)


    private void updateDesignSuccess(CustomDesigns design, String presignedUrl, AICallbackRequest request) {
        design.setRenderImageUrl(presignedUrl);                // Frontend-də göstərmək üçün URL
        design.setMinioObjectKey(request.getMinioObjectKey()); // Daimi saxlama açarı (MinIO yolu)
        design.setStatus(Enums.DesignProcessStatus.COMPLETED);
        design.setPromptUsed(request.getPromptUsed());

        customDesignRepository.save(design);

        log.debug(" Design updated in DB: designId={}, url={}", design.getId(), presignedUrl);
    }

    private void updateRedisCache(AICallbackRequest request, String presignedUrl, CustomDesigns design) {
        // Generating statusunu silirik
        designCacheRepository.removeGeneratingStatus(request.getCacheKey());

        // Completed statusunu əlavə edirik
        designCacheRepository.saveCompletedDesign(
                request.getCacheKey(),
                presignedUrl,                  // Frontend üçün hazır URL
                request.getMinioObjectKey(),
                request.getDesignId(),
                !design.isCustom(),            // isPublic = !isCustom
                request.getUserId()
        );

        log.debug(" Redis cache updated: cacheKey={}", request.getCacheKey());
    }

    private void handleFailure(AICallbackRequest request) {
        //  DB statusunu FAILED et
        customDesignRepository.findById(request.getDesignId()).ifPresent(design -> {
            design.setStatus(Enums.DesignProcessStatus.FAILED);
            customDesignRepository.save(design);
            log.warn(" Design marked as FAILED in DB: designId={}", request.getDesignId());
        });

        // Redis-i təmizlə
        if (request.getCacheKey() != null) {
            designCacheRepository.removeGeneratingStatus(request.getCacheKey());
        }
    }
}
