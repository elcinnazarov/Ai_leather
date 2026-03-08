package com.aiatelye.leather.mapper;

import com.aiatelye.leather.cache.DesignCacheRepository;
import com.aiatelye.leather.dao.CustomDesigns;
import com.aiatelye.leather.dto.AiDesinger.DesignStatusResponse;
import com.aiatelye.leather.enums.Enums;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DesignStatusMapper {

    // DB entity → Response
    @Mapping(target = "designId", source = "id")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "progress", constant = "0") // DB-də progres yoxdur
    @Mapping(target = "estimatedSecondsRemaining", ignore = true)
    @Mapping(target = "renderImageUrl", source = "renderImageUrl")
    @Mapping(target = "errorMessage", ignore = true)
    DesignStatusResponse toResponse(CustomDesigns design);

    // Cache data → Response (with design for additional info)
    @Mapping(target = "designId", source = "cached.designId")
    @Mapping(target = "status", source = "cached.status")
    @Mapping(target = "progress", expression = "java(calculateProgress(cached))")
    @Mapping(target = "estimatedSecondsRemaining", expression = "java(calculateRemaining(cached))")
    @Mapping(target = "renderImageUrl", ignore = true) // GENERATING-də URL yoxdur
    @Mapping(target = "errorMessage", ignore = true)
    DesignStatusResponse toResponseFromCache(DesignCacheRepository.GeneratingData cached, CustomDesigns design);

    // Helper methods
    default Integer calculateProgress(DesignCacheRepository.GeneratingData cached) {
        if (cached == null || cached.getStatus() != Enums.DesignProcessStatus.GENERATING) {
            return 100;
        }

        long elapsed = System.currentTimeMillis() - cached.getTimestamp();
        long estimatedTotal = 30000; // 30 saniyə estimate

        int progress = (int) ((elapsed * 100) / estimatedTotal);
        return Math.min(progress, 95); // 100% yalnız COMPLETED-də
    }

    default Integer calculateRemaining(DesignCacheRepository.GeneratingData cached) {
        if (cached == null) return null;

        long elapsed = System.currentTimeMillis() - cached.getTimestamp();
        long estimatedTotal = 30000; // 30 saniyə

        int remaining = (int) ((estimatedTotal - elapsed) / 1000);
        return Math.max(remaining, 0);
    }
}
