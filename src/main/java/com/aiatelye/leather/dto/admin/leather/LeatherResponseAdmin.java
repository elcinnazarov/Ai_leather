package com.aiatelye.leather.dto.admin.leather;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeatherResponseAdmin {

    private Long id;
    private String leathername;        // DB: leather_name
    private String imageUrl;           // DB: texture_image_url
    private String color;
    private String origin;
    private String description;
    private Boolean isActive;
    private Enums.AvailabilityStatus availabilityStatus;
    private Enums.GradeType gradeType; // grade.gradename-dən gəlir

}
