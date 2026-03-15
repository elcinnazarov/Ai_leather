package com.aiatelye.leather.service.design;

import com.aiatelye.leather.cache.DesignCacheRepository;
import com.aiatelye.leather.dao.*;
import com.aiatelye.leather.dto.AiDesinger.GenerateDesignRequest;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.error.Exception.UserCustomLimitNotFound;
import com.aiatelye.leather.error.Exception.UserLimitNotFoundException;
import com.aiatelye.leather.messaging.rabbitMQ.DesingPublicsher;
import com.aiatelye.leather.messaging.rabbitMQ.event.DesignGenerationEvent;
import com.aiatelye.leather.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.time.LocalDateTime;

    @Slf4j
    @Service
    @RequiredArgsConstructor
    public class DesignPersistenceService {
        private final UserLimitRepository userLimitRepository;
        private final CustomDesignRepository customDesignRepository;
        private final DesignCacheRepository designCacheRepository;
        private final DesingPublicsher designPublisher;
        private final UserRepository userRepository;
        private final ProductModelRepository productModelRepository;
        private final LeatherRepository leatherRepository;

        // ==========================================
        // USER LIMIT MANAGEMENT//
        // ==========================================
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public UserLimit getOrCreateAndResetLimit(Long userId) {
            UserLimit limit = userLimitRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        UserLimit newLimit = new UserLimit();
                        newLimit.setId(userId);
                        newLimit.setDailyCustomLimit(5);
                        newLimit.setDailyStandardLimit(100);
                        newLimit.setUsedTodayCount(0);
                        newLimit.setUsedStandardToday(0);
                        newLimit.setLastResetDate(LocalDateTime.now());
                        return userLimitRepository.save(newLimit);
                    });

            // Gündəlik reset yoxlanışı
            if (limit.getLastResetDate() == null ||
                    !limit.getLastResetDate().toLocalDate().equals(LocalDateTime.now().toLocalDate())) {
                limit.setUsedTodayCount(0);
                limit.setUsedStandardToday(0);
                limit.setLastResetDate(LocalDateTime.now());
                limit = userLimitRepository.save(limit);
                log.info("Daily limits reset for user: {}", userId);
            }
            return limit;
        }

        // ==========================================
        // CUSTOM DESIGN (Xüsusi, limitli)
        // ==========================================
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public CustomDesigns saveCustomDesignAndPublish(Long userId, GenerateDesignRequest request,
                                                        ProductModel product, Leather leather, String cacheKey) {
            // 1. Limit artır
            UserLimit userLimit = userLimitRepository.findByUserId(userId)
                    .orElseThrow(() -> new UserCustomLimitNotFound("User custom limit record not found for user ID: {} "+ userId));
            userLimit.setUsedTodayCount(userLimit.getUsedTodayCount() + 1);
            userLimitRepository.save(userLimit);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("user not-found"));

            String ProductModelImageUrl= productModelRepository.findPrimaryProductImageUrl(product.getId()).
                    orElseThrow(()-> new NotFoundException("Image URL not found"));

            String LeatherImageUrl= leatherRepository.findLeatherImageUrl(leather.getId()).
                    orElseThrow(()->new NotFoundException(" Image URL not found"));

            // 2. Dizayn yarat
            CustomDesigns design = CustomDesigns.builder()
                    .productModel(product)
                    .leather(leather)
                    .cacheKey(cacheKey)                    // "custom:UUID" formatı
                    .isCustom(true)
                    .status(Enums.DesignProcessStatus.GENERATING)
                    .gender(request.getGender())
                    .category(request.getCategory())
                    .customPrompt(request.getCustomPrompt())
                    .userText(null)                        // Custom-də userText yoxdur
                    .iconId(request.getIconId())                          // Custom-də icon yoxdur
                    .placementType(request.getPlacementType())                   // Custom-də placement yoxdur
                    .hitCount(0)
                    .user(user)
                    .build();

            design = customDesignRepository.save(design);

            // 3. Redis generating status ( userId ilə)
            designCacheRepository.saveGeneratingStatus(cacheKey, design.getId(), userId);

            // 4. RabbitMQ event (tranzaksiyadan sonra)
            DesignGenerationEvent event = DesignGenerationEvent.builder()
                    .designId(design.getId())
                    .userId(userId)
                    .productModelId(request.getProductModelId())
                    .leatherId(request.getLeatherId())
                    .leatherImageUrl(LeatherImageUrl)
                    .productModelImageUrl(ProductModelImageUrl)
                    .userText(request.getCustomPrompt())
                    .gender(request.getGender())
                    .category(request.getCategory())
                    .cacheKey(cacheKey)
                    .isCustom(true)
                    .status(Enums.DesignProcessStatus.GENERATING)
                    .timestamp(LocalDateTime.now())
                    .build();

            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    designPublisher.send(event);
                    log.info("Custom design queued: designId={}, userId={}", event.getDesignId(), userId);
                }
            });

            return design;
        }

        // ==========================================
        // STANDARD DESIGN (Cache-lənən, limitsiz)
        // ==========================================
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public CustomDesigns saveStandardDesignAndPublish(Long userId, GenerateDesignRequest request,
                                                          ProductModel product, Leather leather,
                                                          String normalizedText, String cacheKey) {
            // 1. Limit artır
            UserLimit userLimit = userLimitRepository.findByUserId(userId)
                    .orElseThrow(() -> new UserLimitNotFoundException("User limit record not found for user ID: {}"+ userId));
            userLimit.setUsedStandardToday(userLimit.getUsedStandardToday() + 1);
            userLimitRepository.save(userLimit);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("user.not-found"));


            String ProductModelImageUrl= productModelRepository.findPrimaryProductImageUrl(product.getId()).
                    orElseThrow(()-> new NotFoundException("Image URL not found"));

            String LeatherImageUrl= leatherRepository.findLeatherImageUrl(leather.getId()).
                    orElseThrow(()->new NotFoundException(" Image URL not found"));
            // 2. Dizayn yarat
            CustomDesigns design = CustomDesigns.builder()
                    .productModel(product)
                    .leather(leather)
                    .cacheKey(cacheKey)                    // MD5 hash formatı
                    .isCustom(false)                      //  FALSE - standard
                    .status(Enums.DesignProcessStatus.GENERATING)
                    .gender(request.getGender())
                    .category(request.getCategory())
                    .userText(normalizedText)              //  Standard text
                    .customPrompt(null)                    // Standard-da customPrompt yoxdur
                    .iconId(request.getIconId())          //  Icon
                    .placementType(request.getPlacementType()) // Placement
                    .hitCount(0)
                    .user(user)
                    .build();

            design = customDesignRepository.save(design);

            // 3. Redis generating status (userId ilə)
            designCacheRepository.saveGeneratingStatus(cacheKey, design.getId(), userId);

            // 4. RabbitMQ event
            DesignGenerationEvent event = DesignGenerationEvent.builder()
                    .designId(design.getId())
                    .userId(userId)
                    .productModelId(request.getProductModelId())
                    .leatherId(request.getLeatherId())
                    .productModelImageUrl(ProductModelImageUrl)
                    .leatherImageUrl(LeatherImageUrl)
                    .userText(normalizedText)
                    .gender(request.getGender())
                    .category(request.getCategory())
                    .iconId(request.getIconId())
                    .placementType(request.getPlacementType())
                    .cacheKey(cacheKey)
                    .isCustom(false)
                    .status(Enums.DesignProcessStatus.GENERATING)
                    .timestamp(LocalDateTime.now())
                    .build();

            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    designPublisher.send(event);
                    log.info("Standard design queued: designId={}, userId={}, hash={}",
                            event.getDesignId(), userId, cacheKey);
                }
            });

            return design;
        }

    }


