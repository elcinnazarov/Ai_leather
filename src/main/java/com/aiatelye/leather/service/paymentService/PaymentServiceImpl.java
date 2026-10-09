package com.aiatelye.leather.service.paymentService;
import com.aiatelye.leather.client.EpointClient;
import com.aiatelye.leather.client.PayriffClient;
import com.aiatelye.leather.dao.Order;
import com.aiatelye.leather.dao.Payment;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.dto.payment.*;
import com.aiatelye.leather.dto.payment.Epoint.EpointCallbackData;
import com.aiatelye.leather.dto.payment.Epoint.EpointPaymentRequest;
import com.aiatelye.leather.dto.payment.Epoint.EpointPaymentResponse;
import com.aiatelye.leather.dto.payment.Epoint.EpointStatusResponse;
import com.aiatelye.leather.error.Exception.BadRequestException;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.error.Exception.PaymentFailedException;
import com.aiatelye.leather.repository.OrderRepository;
import com.aiatelye.leather.repository.PaymentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ObjectMapper objectMapper;
    private final EpointClient epointClient;
    private final PayriffClient payriffClient; // Arxiv kimi qalır

    @Override
    @Transactional
    public CheckoutResponse checkout(Long orderId, Long userId) {

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        // 1. Sahiblik yoxlaması
        if (!Objects.equals(order.getUser().getId(), userId)) {
            throw new BadRequestException("This order does not belong to you");
        }

        // 2. Yalnız PENDING statuslu order üçün checkout açıla bilər
        if (order.getStatus() != Enums.OrderStatus.PENDING) {
            throw new BadRequestException("Order is not payable, current status: " + order.getStatus());
        }

        // 3. Artıq uğurlu ödəniş varsa, təkrar checkout açma
        if (order.getPaymentStatus() == Enums.PaymentStatus.SUCCESS) {
            throw new BadRequestException("Order is already paid");
        }

        // 4. ✅ VALYUTA MƏNTİQİ: USD gələndə birbaşa USD, EUR gələndə EUR, AZN gələndə AZN!
        Enums.Currency orderCurrency = order.getCurrency() != null ? order.getCurrency() : Enums.Currency.AZN;
        BigDecimal chargeAmount = order.getFinalPrice() != null
                ? order.getFinalPrice().setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String currencyCode = orderCurrency.name(); // "USD", "EUR", "AZN"
        String language = "en"; // Beynəlxalq və yerli kartlar üçün ən uyğun dil

        log.info("Creating ePoint checkout for Order #{}: Amount = {} {}, Language = {}",
                order.getId(), chargeAmount, currencyCode, language);

        // 5. ePoint sorğusunun formalaşdırılması
        EpointPaymentRequest epointRequest = EpointPaymentRequest.builder()
                .amount(chargeAmount)
                .currency(currencyCode)
                .language(language)
                .orderId(String.valueOf(order.getId()))
                .description("Order #" + order.getOrderNumber() + " - E1000 Leather Atelier")
                .build();

        EpointPaymentResponse response = epointClient.createPayment(epointRequest);

        if (!response.isSuccess() || response.getRedirectUrl() == null) {
            log.error("ePoint create payment failed for order {}: message={}, traceId={}",
                    order.getId(), response.getMessage(), response.getTraceId());
            throw new PaymentFailedException("ePoint payment URL alına bilmədi: " + response.getMessage());
        }

        // 6. Payment qeydini yarat və ya yenilə
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(Payment::new);

        payment.setProvider("EPOINT");
        payment.setProviderPaymentId(response.getTransaction());
        payment.setAmount(chargeAmount);
        payment.setCurrency(orderCurrency);
        payment.setStatus(Enums.PaymentStatus.WAITING);
        payment.setRawResponse(toJson(response));
        payment.setCreatedAt(payment.getCreatedAt() != null ? payment.getCreatedAt() : LocalDateTime.now());
        payment.setOrder(order);

        paymentRepository.save(payment);
        order.setPayment(payment);
        orderRepository.save(order);

        log.info("ePoint checkout successfully created: orderId={}, transactionId={}, redirectUrl={}",
                order.getId(), response.getTransaction(), response.getRedirectUrl());

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .providerOrderId(response.getTransaction())
                .paymentUrl(response.getRedirectUrl())
                .build();
    }

    /**
     * ePoint Webhook Callback emalı (İmzalı və İkiqat Təsdiqli)
     */
    @Transactional
    public void handleEpointCallback(String data, String signature) {

        // 1. Təhlükəsizlik: Rəqəmsal İmza (Signature) yoxlaması
        if (!epointClient.verifySignature(data, signature)) {
            log.error("ePoint callback rejected: INVALID_SIGNATURE");
            throw new BadRequestException("Invalid signature");
        }

        // 2. Data deşifrə edilir
        EpointCallbackData callbackData = epointClient.parseCallbackData(data);
        if (callbackData == null || callbackData.getTransaction() == null) {
            log.warn("ePoint callback data could not be parsed: {}", data);
            return;
        }

        log.info("ePoint callback valid: transaction={}, orderId={}, status={}",
                callbackData.getTransaction(), callbackData.getOrderId(), callbackData.getStatus());

        Payment payment = paymentRepository.findByProviderPaymentId(callbackData.getTransaction())
                .orElseThrow(() -> new NotFoundException("Payment not found for transaction: " + callbackData.getTransaction()));

        Order order = payment.getOrder();

        // 3. Idempotency: Əgər artıq SUCCESS-dirsə təkrar etmə
        if (payment.getStatus() == Enums.PaymentStatus.SUCCESS) {
            log.info("Callback ignored: Payment already SUCCESS for orderId={}", order.getId());
            return;
        }

        // 4. İKİQAT TƏSDİQ (Double Check): ePoint serverindən statusu təkrar yoxlayırıq
        EpointStatusResponse statusResponse = epointClient.getStatus(callbackData.getTransaction());

        if (statusResponse.isApproved()) {
            payment.setStatus(Enums.PaymentStatus.SUCCESS);
            payment.setConfirmedAt(LocalDateTime.now());
            payment.setRawResponse(toJson(statusResponse));

            order.setPaymentStatus(Enums.PaymentStatus.SUCCESS);
            if (order.getStatus().canTransitionTo(Enums.OrderStatus.PAID)) {
                order.setStatus(Enums.OrderStatus.PAID);
                order.setPaidAt(LocalDateTime.now());
            }
            log.info("Payment SUCCESS confirmed by ePoint for order {}", order.getId());
        } else {
            payment.setStatus(Enums.PaymentStatus.FAILED);
            payment.setRawResponse(toJson(statusResponse));
            order.setPaymentStatus(Enums.PaymentStatus.FAILED);
            log.warn("Payment FAILED for order {}: ePoint status = {}", order.getId(), statusResponse.getStatus());
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    // Köhnə Payriff üçün metod (lazım olduqda geri dönmək üçün toxunulmaz saxlanılıb)
    @Override
    @Transactional
    public void handleCallback(PayriffCallbackPayload callbackPayload) {
        log.info("Legacy Payriff callback called.");
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("JSON serialization error: ", e);
            return null;
        }
    }
}