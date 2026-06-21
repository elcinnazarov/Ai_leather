package com.aiatelye.leather.dto.order;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {

    private Long orderId;
    private String orderNumber;
    private Enums.OrderType orderType;
    private Enums.OrderStatus status;
    private Enums.PaymentStatus paymentStatus;
    private Enums.DesignProcessStatus designStatus;

    private BigDecimal subTotal;
    private BigDecimal shippingFee;
    private BigDecimal finalPrice;
    private Enums.Currency currency;

    private String deliveryAddress;
    private String customerPhone;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime completedAt;

    private List<OrderItemResponse> items;

    @Data
    @Builder    
    public static class OrderItemResponse {
        private Long orderItemId;
        private Long productModelId;
        private String productModelName;
        private Long leatherId;
        private String leatherName;
        private String renderImageUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

}
