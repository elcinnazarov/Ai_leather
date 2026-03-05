package com.aiatelye.leather.dto.admin.order;

import com.aiatelye.leather.enums.Enums;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class OrderFilter {

    private Long id;

    @Size(max = 50, message = "Order number is too long")
    private String orderNumber;

    private Enums.OrderStatus status;
    private Enums.PaymentStatus paymentStatus;

    @Email(message = "Please provide a valid email format")
    @Size(max = 100)
    private String customerEmail;

    @Size(max = 100)
    private String customerName;

    @PastOrPresent(message = "tart date cannot be in the future")
    private LocalDate from;

    private LocalDate to;

    @PositiveOrZero(message = "Minimum amount cannot be negative")
    private BigDecimal minAmount;

    @PositiveOrZero(message = "Start date must be before end date")
    private BigDecimal maxAmount;

    // Məntiqi yoxlama metodu (Service qatında və ya custom validator ilə çağırıla bilər)
    @AssertTrue(message = "Start date must be before end date")
    public boolean isValidDateRange() {
        if (from != null && to != null) {
            return !from.isAfter(to);
        }
        return true;
    }

    @AssertTrue(message = "Min amount must be less than or equal to Max amount")
    public boolean isValidAmountRange() {
        if (minAmount != null && maxAmount != null) {
            return minAmount.compareTo(maxAmount) <= 0;
        }
        return true;
    }
}
