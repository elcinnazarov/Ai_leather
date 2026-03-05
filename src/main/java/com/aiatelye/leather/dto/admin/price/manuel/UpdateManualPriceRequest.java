package com.aiatelye.leather.dto.admin.price.manuel;

import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.validators.NotBaseCurrencyAZN;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateManualPriceRequest {

    @NotNull(message = "Grade ID is required")
    private Long gradeId;

    @NotBaseCurrencyAZN
    @NotNull(message = "Currency is required")
    private Enums.Currency currency;

    @NotNull(message = "Manual price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal manualPrice;
}
