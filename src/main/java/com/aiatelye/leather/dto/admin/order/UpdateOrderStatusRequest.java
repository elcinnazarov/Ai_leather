package com.aiatelye.leather.dto.admin.order;

import com.aiatelye.leather.dao.enums.Enums;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {

    @NotNull(message = "Status is required")
    private Enums.OrderStatus newStatus;

    private String notes; // Admin üçün qeyd (optional)
}
