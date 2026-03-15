package com.aiatelye.leather.dto.admin.product;
import com.aiatelye.leather.dao.enums.Enums;
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
    private String modelname;
    private Enums.ProductCategory modelType;
    private String primaryImageUrl;
    private List<ProductImageResponse> images;
    private String description;
    private String dimensions;
    private Enums.AvailabilityStatus availabilityStatus;
    private LocalDateTime createdAt;
}


