package com.aiatelye.leather.dto.catalog.leather;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GradeListResponse {
    private Long id;
    private String name; // STANDARD, PREMIUM, EXOTIC
    private String description;
    private Integer leatherCount;
}



















