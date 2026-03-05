package com.aiatelye.leather.dto.catalog.product;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class P_AvailableLeatherResponse {
    private Long id;
    private String name;
    private String color;
    private String textureUrl;
    private Integer stockAmount;
    private String gradeType;
    private String origin;
}
