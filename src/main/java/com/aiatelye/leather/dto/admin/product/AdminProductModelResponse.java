package com.aiatelye.leather.dto.admin.product;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductModelResponse {

    private Long id;
    private String modelname;                    // DB: model_name
    private Enums.ProductCategory modelType;     // DB: model_type
    private String description;
    private String dimensions;                   // JSON string
    private Boolean isActive;                      // DB: is_active (default false)
    private Enums.AvailabilityStatus availabilityStatus; // DB: availability_status (default DRAFT)
    private LocalDateTime createdAt;             // DB: created_at
    private LocalDateTime updatedAt;             // DB: updated_at

    // Images
    private List<AdminProductImageResponse> images;
    private String primaryImageUrl;              // isPrimary=true olanın URL-i

    // Grade Prices (qiymətlər)
    private List<AdminGradePriceResponse> gradePrices;

    // Stats
    private Integer imageCount;
    private Integer gradePriceCount;
    private Integer favoriteCount;
}




















