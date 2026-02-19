package com.aiatelye.leather.dto.product;

import lombok.Data;

@Data
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private Integer imageOrder;
    private Boolean isPrimary;
}
