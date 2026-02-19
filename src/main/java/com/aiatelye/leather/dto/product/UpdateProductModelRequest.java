package com.aiatelye.leather.dto.product;


import com.aiatelye.leather.enums.Enums;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UpdateProductModelRequest {
    @NotBlank(message = "Model name is required")
    @Size(min = 3, max = 100, message = "Model name must be between 3-100 characters")
    private String modelName;

    @NotNull(message = "Model type is required")
    private Enums.ProductCategory modelType;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private String dimensions;

}
