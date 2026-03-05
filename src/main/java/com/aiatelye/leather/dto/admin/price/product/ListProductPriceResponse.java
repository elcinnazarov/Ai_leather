package com.aiatelye.leather.dto.admin.price.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListProductPriceResponse {

    private Long productModelId;
    private String productModelName;
    private List<ProductPriceResponse> prices;
    private int totalCount;
    private int successCount;
    private List<String> errors;
}
