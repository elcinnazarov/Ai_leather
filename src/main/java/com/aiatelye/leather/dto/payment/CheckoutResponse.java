package com.aiatelye.leather.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Frontend bu cavabı alır və "paymentUrl"-ə müştərini yönləndirir
 * (window.location.href = paymentUrl və ya redirect).
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutResponse {
    private Long orderId;
    private String providerOrderId;
    private String paymentUrl;
}
