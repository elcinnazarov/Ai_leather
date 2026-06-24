package com.aiatelye.leather.service.paymentService;

import com.aiatelye.leather.client.PayriffClient;
import com.aiatelye.leather.config.PayriffProperties;
import com.aiatelye.leather.dao.Order;
import com.aiatelye.leather.dao.Payment;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.dto.payment.*;
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

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PayriffProperties payriffProperties;
    private final ObjectMapper objectMapper;
    private final PayriffClient payriffClient;

    @Override
    @Transactional
    public CheckoutResponse checkout(Long orderId, Long userId) {

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        // Sahiblik yoxlaması - başqasının order-i üçün ödəniş yarada bilməz
        if (order.getUser().getId() != userId) {
            throw new BadRequestException("This order does not belong to you");
        }

        // Yalnız PENDING statuslu order üçün checkout açıla bilər
        if (order.getStatus() != Enums.OrderStatus.PENDING) {
            throw new BadRequestException("Order is not payable, current status: " + order.getStatus());
        }

        // Artıq uğurlu ödəniş varsa, təkrar checkout açma (idempotent davranış)
        if (order.getPaymentStatus() == Enums.PaymentStatus.SUCCESS) {
            throw new BadRequestException("Order is already paid");
        }

        String callbackUrlWithToken = payriffProperties.getCallbackUrl()
                + "?token=" + payriffProperties.getCallbackToken();

        PayriffCreateOrderRequest payriffRequest = PayriffCreateOrderRequest.builder()
                .amount(order.getFinalPrice())
                .language("AZ")
                .currency(order.getCurrency().name())
                .description("Order #" + order.getOrderNumber())
                .callbackUrl(callbackUrlWithToken)
                .cardSave(false)
                .operation("PURCHASE")
                .metadata(Map.of(
                        "orderId", String.valueOf(order.getId()),
                        "orderNumber", order.getOrderNumber()
                ))
                .build();

        PayriffResponse<PayriffOrderPayload> response = payriffClient.createOrder(payriffRequest);

        if (!response.isSuccess() || response.getPayload() == null
                || response.getPayload().getPaymentUrl() == null) {
            log.warn("PayRiff create-order failed for order {}: code={}, message={}",
                    order.getId(), response.getCode(), response.getMessage());
            throw new PaymentFailedException("Payment provider did not return a payment URL");
        }

        PayriffOrderPayload payload = response.getPayload();

        // Payment yarat/yenilə (eyni order üçün yenidən checkout edilərsə üzərinə yazırıq)
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(Payment::new);

        payment.setProvider("PAYRIFF");
        payment.setProviderPaymentId(payload.getOrderId());
        payment.setAmount(order.getFinalPrice());
        payment.setCurrency(order.getCurrency());
        payment.setStatus(Enums.PaymentStatus.WAITING);
        payment.setRawResponse(toJson(response));
        payment.setCreatedAt(payment.getCreatedAt() != null ? payment.getCreatedAt() : LocalDateTime.now());
        payment.setOrder(order);

        paymentRepository.save(payment);
        order.setPayment(payment);
        orderRepository.save(order);

        log.info("PayRiff checkout created: orderId={}, providerOrderId={}", order.getId(), payload.getOrderId());

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .providerOrderId(payload.getOrderId())
                .paymentUrl(payload.getPaymentUrl())
                .build();
    }

    @Override
    @Transactional
    public void handleCallback(PayriffCallbackPayload callbackPayload) {

        if (callbackPayload.getOrderId() == null) {
            log.warn("PayRiff callback received without orderId, ignoring. payload={}", callbackPayload);
            return;
        }

        Payment payment = paymentRepository.findByProviderPaymentId(callbackPayload.getOrderId())
                .orElseThrow(() -> new NotFoundException(
                        "Payment not found for PayRiff orderId: " + callbackPayload.getOrderId()));

        Order order = payment.getOrder();

        // Artıq son nəticə yazılıbsa, təkrar emal etmə (callback bir neçə dəfə gələ bilər)
        if (payment.getStatus() == Enums.PaymentStatus.SUCCESS) {
            log.info("Callback ignored, payment already SUCCESS. orderId={}", order.getId());
            return;
        }

        payment.setRawResponse(toJson(callbackPayload));

        String status = callbackPayload.getStatus() == null ? "" : callbackPayload.getStatus().toUpperCase();

        switch (status) {
            case "APPROVED", "PREAUTH_APPROVED" -> {
                payment.setStatus(Enums.PaymentStatus.SUCCESS);
                payment.setConfirmedAt(LocalDateTime.now());

                order.setPaymentStatus(Enums.PaymentStatus.SUCCESS);
                if (order.getStatus().canTransitionTo(Enums.OrderStatus.PAID)) {
                    order.setStatus(Enums.OrderStatus.PAID);
                    order.setPaidAt(LocalDateTime.now());
                }
                log.info("Payment SUCCESS for order {}", order.getId());
            }
            case "DECLINED", "EXPIRED" -> {
                payment.setStatus(Enums.PaymentStatus.FAILED);
                order.setPaymentStatus(Enums.PaymentStatus.FAILED);
                log.info("Payment FAILED for order {} (status={})", order.getId(), status);
            }
            case "CANCELED" -> {
                payment.setStatus(Enums.PaymentStatus.CANCELLED);
                order.setPaymentStatus(Enums.PaymentStatus.CANCELLED);
                log.info("Payment CANCELLED for order {}", order.getId());
            }
            case "REFUNDED", "REVERSE", "PARTIAL_REFUND" -> {
                payment.setStatus(Enums.PaymentStatus.REFUNDED);
                order.setPaymentStatus(Enums.PaymentStatus.REFUNDED);
                log.info("Payment REFUNDED for order {}", order.getId());
            }
            default -> log.warn("Unknown PayRiff callback status '{}' for order {}", status, order.getId());
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("Could not serialize PayRiff payload for storage", e);
            return null;
        }
    }
}

