package com.aiatelye.leather.dto;
import com.aiatelye.leather.enums.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;


import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ProductModelResponse {
    private Long id;
    private String modelName;
    private Enums.ModelType modelType;
    private String primaryImageUrl;
    private List<ProductImageResponse> images;
    private String description;
    private String dimensions;
    private Enums.AvailabilityStatus availabilityStatus;
    private LocalDateTime createdAt;
}


