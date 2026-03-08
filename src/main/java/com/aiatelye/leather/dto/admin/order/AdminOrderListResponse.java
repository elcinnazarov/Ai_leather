package com.aiatelye.leather.dto.admin.order;

import com.aiatelye.leather.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminOrderListResponse {

    private Long id;
    private String orderNumber;

    private String customerName;
    private String customerEmail;
    private BigDecimal shippingFee;
    private BigDecimal subTotal;
    private BigDecimal finalPrice;
    private Enums.Currency currency;
    private Enums.OrderStatus status;
    private Enums.PaymentStatus paymentStatus;

    private LocalDateTime createdAt;
    private int itemCount; // Neçə məhsul var

}
