package com.aiatelye.leather.dto.catalog.leather;

import com.aiatelye.leather.dao.enums.Enums;
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
