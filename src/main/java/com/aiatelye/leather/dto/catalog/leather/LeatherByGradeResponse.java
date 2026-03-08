package com.aiatelye.leather.dto.catalog.leather;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LeatherByGradeResponse {
    private Long id;
    private String name;
    private String color;
    private String imageUrl;
    private String origin;
    private LocalDateTime createdAt;
}
