package com.aiatelye.leather.dto.AiDesinger;

import com.aiatelye.leather.enums.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignStatusResponse {
    private Long designId;
    private Enums.DesignProcessStatus status;
    @Builder.Default
    private Integer progress = 0;
    private Integer estimatedSecondsRemaining;
    private String renderImageUrl;
    private String errorMessage;
}
