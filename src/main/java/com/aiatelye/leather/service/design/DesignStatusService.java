package com.aiatelye.leather.service.design;

import com.aiatelye.leather.cache.DesignCacheRepository;
import com.aiatelye.leather.dao.CustomDesigns;
import com.aiatelye.leather.dto.AiDesinger.DesignStatusResponse;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.error.Exception.UnauthorizedException;
import com.aiatelye.leather.mapper.DesignStatusMapper;
import com.aiatelye.leather.repository.CustomDesignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesignStatusService {

    private final CustomDesignRepository customDesignRepository;
    private final DesignCacheRepository designCacheRepository;
    private final DesignStatusMapper designStatusMapper;

    @Transactional(readOnly = true)
    public DesignStatusResponse getStatus(Long designId, Long userId) {
        // 1. DB-dən dizaynı tap
        CustomDesigns design = customDesignRepository.findById(designId)
                .orElseThrow(() -> new NotFoundException("error.design.not-found"));

        // 2. Security check: User öz dizaynını görür və ya ADMIN
        if (!Objects.equals(design.getUser().getId(), userId) && !isAdmin(userId)) {
            log.error("Səlahiyyətsiz giriş cəhdi! User: {}, Design Owner: {}", userId, designId);
            throw new UnauthorizedException("Bu məlumatı görmək üçün icazəniz yoxdur.");
        }

        // 3. Cache-dən real-time status yoxla (Redis L1)
        DesignCacheRepository.GeneratingData cachedStatus = designCacheRepository.getGeneratingStatus(design.getCacheKey());

        if (cachedStatus != null) {
            log.info("Cache status hit: designId={}, status={}", designId, cachedStatus.getStatus());
            return designStatusMapper.toResponseFromCache(cachedStatus, design);
        }

        // 4. Cache miss → DB status qaytar
        log.info("Cache miss, returning DB status: designId={}, status={}",
                designId, design.getStatus());

        return designStatusMapper.toResponse(design);
    }

    private boolean isAdmin(Long userId) {
        // CurrentContext-dən role check
        return false; // Implement based on your CurrentContext
    }
}
