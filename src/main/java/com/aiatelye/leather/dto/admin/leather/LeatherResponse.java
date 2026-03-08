package com.aiatelye.leather.dto.admin.leather;


import com.aiatelye.leather.enums.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LeatherResponse {

    private Long id;
    private String leatherName;
    private String textureImageUrl;
    private String color;
    private String origin;
    private Boolean isActive;
    private Enums.AvailabilityStatus availabilityStatus;
    private Enums.GradeType gradeType;

}
