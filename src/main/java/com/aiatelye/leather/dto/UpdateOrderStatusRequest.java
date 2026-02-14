package com.aiatelye.leather.dto;

import com.aiatelye.leather.enums.Enums;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {

    @NotNull(message = "Status is required")
    private Enums.OrderStatus newStatus;

    private String notes; // Admin üçün qeyd (optional)
}
