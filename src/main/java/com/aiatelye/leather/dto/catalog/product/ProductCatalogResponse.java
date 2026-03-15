package com.aiatelye.leather.dto.catalog.product;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductCatalogResponse {

    private List<ProductSummary> content;
    private int pageNumber;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;

    @Data
    @Builder
    public static class ProductSummary {
        private Long id;
        private String modelName;
        private Enums.ProductCategory modelType;
        private String primaryImageUrl;
        private BigDecimal basePrice;
        private String formattedPrice;
        private Enums.Currency currency;
        private LocalDateTime createdAt;
    }

}
