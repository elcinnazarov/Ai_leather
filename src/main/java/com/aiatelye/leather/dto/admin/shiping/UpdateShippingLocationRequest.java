package com.aiatelye.leather.dto.admin.shiping;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class UpdateShippingLocationRequest {
    @NotNull
    @Positive
    private BigDecimal fee;

    private BigDecimal freeThreshold;

    @NotNull
    private Boolean requiresPostalCode;

    @NotNull
    private Boolean isActive;
}
