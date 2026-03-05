package com.aiatelye.leather.dto.admin.price;

import com.aiatelye.leather.enums.Enums;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class DisplayPriceResponse {

    private Long productId;
    private Long gradeId;
    private String gradeType;

    // Bütün valyutalar
    private Map<Enums.Currency, PriceDetail> prices;

    // Hazırki valyuta (header-dən gələn)
    private Enums.Currency currentCurrency;
    private BigDecimal currentAmount;
    private String currentFormatted;

    @Data
    @Builder
    public static class PriceDetail {
        private BigDecimal amount;
        private String source;           // BASE, MANUAL, AUTO
        private String formatted;        // "$256.99"
        private BigDecimal ruleMultiplier;  // AUTO üçün
        private BigDecimal ruleFixed;       // AUTO üçün
    }
}
