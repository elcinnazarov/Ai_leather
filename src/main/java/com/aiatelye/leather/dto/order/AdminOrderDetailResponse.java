package com.aiatelye.leather.dto.order;

import com.aiatelye.leather.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminOrderDetailResponse {

    private Long id;
    private String orderNumber;

    // Müştəri məlumatları
    private CustomerInfo customer;

    // Sifariş məlumatları
    private BigDecimal finalPrice;
    private BigDecimal subTotal;
    private  BigDecimal shippingFee;
    private Enums.Currency currency;

    // Əlaqə məlumatları
    private String customerEmail;
    private String customerPhone;
    private String deliveryAddress;
    private String notes;

    // Statuslar
    private Enums.OrderStatus status;
    private Enums.PaymentStatus paymentStatus;
    private Enums.DesignProcessStatus designStatus;
    private Enums.OrderType orderType;

    // Tarixlər
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
    private LocalDateTime completedAt;

    // OrderItem-lər (snapshot burada!)
    private List<OrderItemDetail> items;

    // Ödəniş məlumatları
    private PaymentDetail payment;

    @Data
    @Builder
    public static class CustomerInfo {
        private Long id;
        private String name;
        private String email;
        private String phone;
    }

    @Data
    @Builder
    public static class OrderItemDetail {
        private Long id;
        private Long productModelId;
        private String productModelName;
        private Long leatherId;
        private String leatherName;
        private String renderImageUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class PaymentDetail {
        private Long id;
        private String provider;
        private BigDecimal amount;
        private Enums.Currency currency;
        private Enums.PaymentStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime confirmedAt;
    }



}
