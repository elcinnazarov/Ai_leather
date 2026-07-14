package com.aiatelye.leather.dto.DeliveryCountry;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ToggleCountryRequest {
    @NotNull(message = "isActive field is required")
    private Boolean isActive;

}
