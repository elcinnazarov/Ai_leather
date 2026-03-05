package com.aiatelye.leather.dto.catalog.product;

import com.aiatelye.leather.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class ProductPriceMatrixResponse {

    private Long productId;
    private String productName;

    // Matris: Grade → (Currency → Price)
    private Map<String, GradePriceMatrix> matrix;

    @Data
    @Builder
    public static class GradePriceMatrix {
        private Long gradeId;
        private String gradeType;
        private Map<Enums.Currency, PriceDetail> prices;
    }

    @Data
    @Builder
    public static class PriceDetail {
        private BigDecimal amount;
        private String formatted;
        private String source; // BASE, MANUAL, AUTO, CACHE
    }

}
