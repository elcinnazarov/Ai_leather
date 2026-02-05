package com.aiatelye.leather.dto;


import com.aiatelye.leather.enums.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ResponseLeather {

    private Long id;
    private String leatherName;
    private String textureImageUrl;
    private String color;
    private String origin;
    private Integer stockAmount;
    private Boolean isActive;
    private Enums.AvailabilityStatus availabilityStatus;
    private Enums.GradeType gradeType;

}
