package com.aiatelye.leather.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
@Data

public class ListUpdateManualPricesRequest {
    @NotEmpty(message = "At least one manual price is required")
    @Valid
    private List<UpdateManualPriceRequest> manualPrices;
}
