package com.aiatelye.leather.controller;

import com.aiatelye.leather.componet.CurrentContext;
import com.aiatelye.leather.config.PayriffProperties;
import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.dto.payment.CheckoutResponse;
import com.aiatelye.leather.dto.payment.PayriffCallbackPayload;
import com.aiatelye.leather.service.paymentService.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final CurrentContext currentContext;
    private final PayriffProperties payriffProperties;

    /**
     * Frontend bu endpoint-i cagirir, PayRiff payment URL-ini alir
     * ve mustərini ora yonləndirir.
     */
    @PostMapping("/api/payments/checkout/{orderId}")
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(@PathVariable Long orderId) {
        Long userId = currentContext.getCurrentUserId();
        log.info("POST /api/payments/checkout/{} - User: {}", orderId, userId);

        CheckoutResponse response = paymentService.checkout(orderId, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PayRiff odenis netice callback-i (webhook).
     * Bu endpoint PUBLIC-dir (JWT yoxdur), cunki PayRiff serveri cagirir.
     *
     * MUHIM: PayRiff webhook-u imzalamir, ona gore callbackUrl-i
     * "https://.../api/internal/payriff-callback?token=GIZLI_DEYER" formasinda
     * konfiqurasiya edib, asagidaki kimi token yoxlamasi etmek MEHSUL UCUN MEHTEC-dir.
     * Elave tehlukesizlik ucun: bu controller-de callback-i aldiqdan sonra
     * "Order Information" GET API-sini (payriff.com/api/v3/orders/:ORDER_ID) cagirib
     * statusu PayRiff-in oz serverinden bir daha tesdiqlemek tovsiye olunur.
     */
    @PostMapping("/api/internal/payriff-callback")
    public ResponseEntity<Void> callback(@RequestBody PayriffCallbackPayload payload,
                                          @RequestParam(value = "token", required = false) String token) {

        if (token == null || !token.equals(payriffProperties.getCallbackToken())) {
            log.warn("PayRiff callback rejected: invalid token. orderId={}", payload.getOrderId());
            return ResponseEntity.status(403).build();
        }

        log.info("PayRiff callback received: orderId={}, status={}", payload.getOrderId(), payload.getStatus());
        paymentService.handleCallback(payload);
        return ResponseEntity.ok().build();
    }
}
