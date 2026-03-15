package com.aiatelye.leather.dto.admin.order;

import com.aiatelye.leather.dto.order.OrderResponse;
import com.aiatelye.leather.dao.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderDetailResponse {
    private Long orderId;
    private String orderNumber;
    private Enums.OrderType orderType;
    private Enums.OrderStatus status;
    private Enums.PaymentStatus paymentStatus;
    private Enums.DesignProcessStatus designStatus;

    private String customerEmail;
    private String customerPhone;
    private String deliveryAddress;
    private String notes;

    private BigDecimal subTotal;
    private BigDecimal shippingFee;
    private BigDecimal finalPrice;
    private Enums.Currency currency;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime completedAt;

    private List<OrderResponse.OrderItemResponse> items;



}

