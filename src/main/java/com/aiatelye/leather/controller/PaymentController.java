package com.aiatelye.leather.controller;

import com.aiatelye.leather.componet.CurrentContext;
import com.aiatelye.leather.config.PayriffProperties;
import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.dto.payment.CheckoutResponse;
import com.aiatelye.leather.dto.payment.PayriffCallbackPayload;
import com.aiatelye.leather.service.paymentService.PaymentService;
import com.aiatelye.leather.service.paymentService.PaymentServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@Slf4j
@RestController
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentServiceImpl paymentService;
    private final CurrentContext currentContext;

    /**
     * Frontend bu endpoint-i çağırır, ePoint ödəniş linkini alır və yönləndirir
     */
    @PostMapping("/api/payments/checkout/{orderId}")
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(@PathVariable Long orderId) {
        Long userId = currentContext.getCurrentUserId();
        log.info("POST /api/payments/checkout/{} - User: {}", orderId, userId);

        CheckoutResponse response = paymentService.checkout(orderId, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * ePoint Webhook Callback (Server-to-Server)
     * ePoint data və signature parametrlərini form-urlencoded olaraq göndərir.
     * Köhnə URL adını saxlayırıq: /api/internal/payriff-callback
     */
    @PostMapping(value = "/api/internal/payriff-callback", consumes = {MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.ALL_VALUE})
    public ResponseEntity<Void> callback(@RequestParam("data") String data,
                                         @RequestParam("signature") String signature) {

        log.info("ePoint webhook received. Verifying signature...");
        paymentService.handleEpointCallback(data, signature);
        return ResponseEntity.ok().build();
    }

    /**
     * Müştəri brauzeri bu ünvana gələrsə 405 xətası vermir,
     * avtomatik uğurlu ödəniş səhifəsinə yönləndirir.
     */
    @GetMapping("/api/internal/payriff-callback")
    public ResponseEntity<Void> handleBrowserReturn() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("https://e1000leather.com/payment/success?status=success"))
                .build();
    }
}
