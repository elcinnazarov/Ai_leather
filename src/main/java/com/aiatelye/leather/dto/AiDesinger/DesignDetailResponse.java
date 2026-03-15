package com.aiatelye.leather.dto.AiDesinger;
import com.aiatelye.leather.dao.enums.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignDetailResponse {
    private Long designId;
    private String renderImageUrl;
    private Enums.DesignProcessStatus status;
    private String promptUsed;
    private String customPrompt;
    private Boolean isCustom;
    private Integer hitCount;
    private LocalDateTime createdAt;
    private ProductInfo product;
    private LeatherInfo leather;

    // Inner classes
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductInfo {
        private Long id;
        private String name;
        private String modelType;
        private String description;
        private String primaryImageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeatherInfo {
        private Long id;
        private String name;
        private String color;
        private String origin;
        private String textureUrl;
        private String gradeName;
    }
}
