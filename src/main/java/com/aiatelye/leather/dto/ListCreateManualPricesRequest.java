package com.aiatelye.leather.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ListCreateManualPricesRequest {
    @NotEmpty(message = "At least one manual price is required")
    @Valid
    private List<CreateManualPriceRequest> manualPrices;
}
