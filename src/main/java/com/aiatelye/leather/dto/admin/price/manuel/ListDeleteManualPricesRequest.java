package com.aiatelye.leather.dto.admin.price.manuel;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ListDeleteManualPricesRequest {

    @NotEmpty(message = "At least one manual price to delete is required")
    @Valid
    private List<DeleteManualPriceRequest> manualPrices;

}
