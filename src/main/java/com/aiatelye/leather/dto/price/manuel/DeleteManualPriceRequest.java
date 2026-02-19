package com.aiatelye.leather.dto.price.manuel;

import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.validators.NotBaseCurrencyAZN;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeleteManualPriceRequest {

    @NotNull(message = "Grade ID is required")
    private Long gradeId;

    @NotBaseCurrencyAZN
    @NotNull(message = "Currency is required")
    private Enums.Currency currency;
}
