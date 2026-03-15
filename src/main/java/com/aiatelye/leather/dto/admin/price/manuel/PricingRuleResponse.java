package com.aiatelye.leather.dto.admin.price.manuel;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class PricingRuleResponse {
    private Long id;
    private Enums.Currency targetCurrency;
    private BigDecimal fixedAmount;
    private BigDecimal multiplier;
    private Boolean roundTo99;
    private String formulaDisplay;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
