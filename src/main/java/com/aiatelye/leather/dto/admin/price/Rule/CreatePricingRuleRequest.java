package com.aiatelye.leather.dto.admin.price.Rule;

import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.validators.MultiplierMinimum1;
import com.aiatelye.leather.validators.NotBaseCurrencyAZN;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data

public class CreatePricingRuleRequest {
    @NotBaseCurrencyAZN
    @NotNull(message = "Target currency is required")
    private Enums.Currency targetCurrency;  // USD, EUR, vs.

    @NotNull(message = "Fixed amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal fixedAmount;         // +20, +30, vs.

    @MultiplierMinimum1
    @NotNull(message = "Multiplier is required")
    @Positive(message = "Multiplier must be positive")
    private BigDecimal multiplier;          // 2.5, 1.9, 1.0

    @NotNull(message = "Round to .99 flag is required")
    private Boolean roundTo99;              // true/false
}
