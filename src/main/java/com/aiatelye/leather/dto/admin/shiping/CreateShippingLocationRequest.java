package com.aiatelye.leather.dto.admin.shiping;

import com.aiatelye.leather.enums.Enums;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CreateShippingLocationRequest {

    @NotNull
    private Enums.Country country;

    private String cityName; // null = country default

    @NotNull
    @Positive
    private BigDecimal fee;

    @NotNull
    private Enums.Currency currency;

    private BigDecimal freeThreshold;

    private Boolean requiresPostalCode;
}
