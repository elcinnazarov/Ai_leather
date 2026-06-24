package com.aiatelye.leather.dto.admin.product;

import com.aiatelye.leather.dao.enums.Enums;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProductModelFilter {
    private Long id;

    @Size(max = 100, message = "Model name is too long")
    private String modelname;

    private Enums.ProductCategory modelType;  // WALLET, BAG, BELT

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

















