package com.aiatelye.leather.dto.price;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCalculatedPriceResponse {

    private Long productId;
    private String productName;
    private List<GradePriceDetail> grades;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GradePriceDetail {
        private Long gradeId;
        private String gradeType;

        // Bütün valyutalar
        private PriceDetail azn;
        private PriceDetail usd;
        private PriceDetail eur;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceDetail {
        private BigDecimal amount;
        private String source;           // BASE, MANUAL, AUTO
        private String formula;          // "2.5x + 7, .99" (AUTO üçün)
        private BigDecimal ruleMultiplier;
        private BigDecimal ruleFixed;
        private Boolean ruleRoundTo99;
    }
}