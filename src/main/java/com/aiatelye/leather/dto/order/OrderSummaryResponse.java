package com.aiatelye.leather.dto.order;

import com.aiatelye.leather.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderSummaryResponse {

    private Long orderId;
    private String orderNumber;
    private Enums.OrderStatus status;
    private Enums.PaymentStatus paymentStatus;
    private BigDecimal finalPrice;
    private Enums.Currency currency;
    private LocalDateTime createdAt;
    private Integer itemCount;
    private String firstProductName;
}
