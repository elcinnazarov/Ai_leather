package com.aiatelye.leather.dto.order;

import com.aiatelye.leather.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrderStatusUpdateResponse {

    private Long orderId;
    private String orderNumber;

    private Enums.OrderStatus oldStatus;
    private Enums.OrderStatus newStatus;

    private String message;
    private LocalDateTime updatedAt;

    // Yeni tarixlər (əgər varsa)
    private LocalDateTime paidAt;
    private LocalDateTime completedAt;
}
