package com.aiatelye.leather.dto.catalog.leather;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class LeatherGradeDetailResponse {

    private Long id;
    private String name; // STANDARD, PREMIUM, EXOTIC
    private String description;

    // Bu grade-ə aid dərilər
    private List<LeatherSummary> leathers;

    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class LeatherSummary {
        private Long id;
        private String name;
        private String color;
        private String textureUrl;
        private String origin;
    }
}
