package com.aiatelye.leather.dto.catalog;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LeatherListResponse {

    private Long id;
    private String name;
    private String color;
    private String textureUrl; // Kiçik preview şəkil
    private String origin;
    //private Integer stockAmount;

    // Grade məlumatları
    private String gradeType;
    private Integer gradeLevel;

    private LocalDateTime createdAt;
}
