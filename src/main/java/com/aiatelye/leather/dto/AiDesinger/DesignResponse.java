package com.aiatelye.leather.dto.AiDesinger;

import com.aiatelye.leather.enums.Enums;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DesignResponse {
    private Long designId;
    private Enums.DesignProcessStatus status;
    private String message;
    private String renderImageUrl;
    private Integer creditsRemaining;
    private Integer estimatedSeconds;
    private String cacheKey;
    private Boolean isCustom;
    private Integer dailyLimit;
    private Integer usedToday;

}
