package com.aiatelye.leather.messaging.rabbitMQ;

import com.aiatelye.leather.cache.DesignCacheRepository;
import com.aiatelye.leather.config.RabbitConfig;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.messaging.rabbitMQ.event.DesignGenerationEvent;
import com.aiatelye.leather.repository.CustomDesignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DesignConsumerDLQ {

    private final CustomDesignRepository customDesignRepository;
    private final DesignCacheRepository designCacheRepository;
    // private final AdminNotificationService adminNotificationService;

    /**
     * Dead Letter Queue - uğursuz dizaynları tutur
     */
    @RabbitListener(queues = RabbitConfig.DESIGN_DLQ)
    public void handleDeadLetter(DesignGenerationEvent event) {
        log.error(" DLQ: Design generation failed after all retries. " +
                        "designId={}, cacheKey={}, isCustom={}",
                event.getDesignId(),
                event.getCacheKey(),
                event.getIsCustom());

        try {
            // 1. DB-də status FAILED et
            updateDesignStatusToFailed(event.getDesignId());

            // 2. Redis-dən GENERATING statusunu sil
            designCacheRepository.removeGeneratingStatus(event.getCacheKey());

            // 3. (Optional) Adminə bildiriş
            // adminNotificationService.sendAlert(
            //     "AI Generation Failed",
            //     String.format("Design ID: %d, Cache Key: %s",
            //         event.getDesignId(), event.getCacheKey())
            // );

        } catch (Exception e) {
            log.error("Failed to process DLQ message for designId={}",
                    event.getDesignId(), e);
        }
    }

    private void updateDesignStatusToFailed(Long designId) {
        customDesignRepository.findById(designId).ifPresent(design -> {
            design.setStatus(Enums.DesignProcessStatus.FAILED);
            design.setUpdatedAt(LocalDateTime.now());
            customDesignRepository.save(design);
            log.info("Design status updated to FAILED: designId={}", designId);
        });
    }
}
