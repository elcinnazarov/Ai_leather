package com.aiatelye.leather.dto.price.manuel;

import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.validators.NotBaseCurrencyAZN;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateManualPriceRequest {
    @NotNull(message = "Grade ID is required")
    private Long gradeId;

    @NotNull(message = "Currency is required")
    @NotBaseCurrencyAZN
    private Enums.Currency currency;  // USD və ya EUR (AZN olmaz)

    @NotNull(message = "Manual price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal manualPrice;   // Manual qiymət (ümumi qayda SÖNÜR)

}
