package com.aiatelye.leather.dto;


import com.aiatelye.leather.enums.Enums;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateProductModelRequest {
    @NotBlank(message = "Model name is required")
    @Size(min = 3, max = 100)
    private String modelName;

    @NotNull(message = "Model type is required")
    private Enums.ProductCategory modelType;

    @NotNull(message = "description is  not be  null")
    @Size(max = 2000)
    private String description;

    private String dimensions;
}
