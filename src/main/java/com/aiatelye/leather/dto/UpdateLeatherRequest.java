package com.aiatelye.leather.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateLeatherRequest {

    @Size(min = 3, max = 100, message = "Leather name must be between 3 and 100 characters")
    private String leatherName;

    @Size(min = 2, max = 50, message = "Color must be between 2 and 50 characters")
    private String color;

    @Size(min = 2, max = 100, message = "Origin must be between 2 and 100 characters")
    private String origin;

    /*@PositiveOrZero(message = "Stock amount cannot be negative")
    private Integer stockAmount;*/

    @Positive(message = "Grade id must be a positive number")
    private Long gradeId;
}
