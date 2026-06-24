package com.aiatelye.leather.dto.admin.leather;

import com.aiatelye.leather.dao.enums.Enums;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class LeatherFilter {

    private Long id;

    @Size(max = 100, message = "Leather name is too long")
    private String leathername;  // DB ilə eyni

    @Size(max = 100, message = "Origin is too long")
    private String origin;

    private String color;

    private Enums.GradeType gradeType;

    private Enums.AvailabilityStatus availabilityStatus;

    private Boolean isActive;

    private LocalDate from;
    private LocalDate to;

    @AssertTrue(message = "Start date must be before or equal to end date")
    public boolean isValidDateRange() {
        if (from != null && to != null) {
            return !from.isAfter(to);
        }
        return true;
    }
}
