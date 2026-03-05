package com.aiatelye.leather.dto.admin.price.Rule;

import com.aiatelye.leather.validators.MultiplierMinimum1;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdatePricingRuleRequest {

    @MultiplierMinimum1
    @Positive(message = "Multiplier must be positive")
    private BigDecimal multiplier;          // 2.5, 1.9

    @Positive(message = "Fixed amount must be positive")
    private BigDecimal fixedAmount;         // 7, 30

    private Boolean roundTo99;              // true/false

    private Boolean isActive;              // true/false

}
