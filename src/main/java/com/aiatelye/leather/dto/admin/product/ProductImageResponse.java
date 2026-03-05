package com.aiatelye.leather.dto.admin.product;

import lombok.Data;

@Data
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private Integer imageOrder;
    private Boolean isPrimary;
}
