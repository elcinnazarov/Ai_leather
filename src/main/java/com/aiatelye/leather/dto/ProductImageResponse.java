package com.aiatelye.leather.dto;

import lombok.Data;

@Data
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private Integer imageOrder;
    private Boolean isPrimary;
}
