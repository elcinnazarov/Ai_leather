package com.aiatelye.leather.dto.admin.price.product;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductPriceResponse {

    private Long id;
    private Long productModelId;
    private String productModelName;
    private Long gradeId;
    private String gradeType;
    private BigDecimal priceAzn;  // Base price
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
