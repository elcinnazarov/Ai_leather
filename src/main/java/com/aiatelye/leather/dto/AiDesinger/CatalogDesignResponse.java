package com.aiatelye.leather.dto.AiDesinger;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CatalogDesignResponse {
    private Long designId;
    private String renderImageUrl;
    private String productModelName;
    private String productCategory;
    private String leatherName;
    private String leatherColor;
    private String userText;
    private String creatorName;
    private LocalDateTime createdAt;
    private Integer hitCount;
    private String priceAzn;
}
