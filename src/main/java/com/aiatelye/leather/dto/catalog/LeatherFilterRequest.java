package com.aiatelye.leather.dto.catalog;

import com.aiatelye.leather.enums.Enums;
import lombok.Data;

@Data
public class LeatherFilterRequest {

    private String color;

    private String origin; // "Italy", "Turkey", "France"

    private Enums.GradeType gradeType; // STANDARD, PREMIUM, EXOTIC

  // private Boolean inStock; //

    // Pagination
    private int page = 0;
    private int size = 20;

}
