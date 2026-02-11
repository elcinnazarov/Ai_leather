package com.aiatelye.leather.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ListManuelPricesResponse {

    private Long productModelId;
    private String productModelName;
    private List<ManualPriceResponse> manualPrices;
    private int totalCount;
    private int successCount;
    private List<String> errors;
}
