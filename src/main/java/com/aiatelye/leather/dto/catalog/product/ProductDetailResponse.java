package com.aiatelye.leather.dto.catalog.product;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductDetailResponse {

    private Long id;
    private String modelName;
    private Enums.ProductCategory modelType;
    private String description;
    private String dimensions;

    // Şəkillər
    private List<ProductImageDTO> images;
    private String primaryImageUrl;

    // Grade qiymətləri (yalnız hazırkı valyutada)
    private List<GradePriceSummary> gradePrices;

    // Hazırkı valyuta
    private Enums.Currency currentCurrency;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class ProductImageDTO {
        private Long id;
        private String imageUrl;
        private Integer imageOrder;
        private Boolean isPrimary;
    }

    @Data
    @Builder
    public static class GradePriceSummary {
        private Long gradeId;
        private String gradeType;
        private BigDecimal amount;
        private String formatted;
    }


}
