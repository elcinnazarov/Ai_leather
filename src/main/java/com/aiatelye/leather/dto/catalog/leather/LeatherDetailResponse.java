package com.aiatelye.leather.dto.catalog.leather;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder

public class LeatherDetailResponse {

    private Long id;
    private String name;
    private String color;
    private String textureUrl; // Əsas tekstura şəkli
    private String origin;
    private String description;

    // Grade məlumatları
    private GradeInfo grade;

    // Əlaqəli məhsullar (bu dərinin istifadə edildiyi məhsullar)
    private List<ProductSummary> usedInProducts;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class GradeInfo {
        private Long id;
        private String name; // STANDARD, PREMIUM, EXOTIC
        private String description;
    }

    @Data
    @Builder
    public static class ProductSummary {
        private Long id;
        private String name;
        private String modelType;
        private String primaryImageUrl;
    }
}

