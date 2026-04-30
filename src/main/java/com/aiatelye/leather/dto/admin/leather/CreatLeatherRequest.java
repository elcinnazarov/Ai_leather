package com.aiatelye.leather.dto.admin.leather;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreatLeatherRequest {

    @NotBlank(message = "Model name is required")
    @Size(min = 3, max = 100)
    private String leatherName;

    @NotBlank(message = "origin is  not be  null")
    private  String origin;

    @NotBlank(message = "description is  not be  null")
    @Size(max = 2000)
    private String description;

    @NotNull(message = "Grade ID is not be null ")
    private Long gradeId;

    @NotNull(message = " color is not be null ")
    private String  color;


}
