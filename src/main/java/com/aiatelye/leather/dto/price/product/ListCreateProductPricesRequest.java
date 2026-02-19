package com.aiatelye.leather.dto.price.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ListCreateProductPricesRequest {
    @NotEmpty(message = "At least one price is required")
    @Valid
    private List<CreateProductPriceRequest> prices;
}
