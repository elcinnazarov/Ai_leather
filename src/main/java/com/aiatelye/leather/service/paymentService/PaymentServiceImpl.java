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
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PayriffProperties payriffProperties;
    private final ObjectMapper objectMapper;
    private final PayriffClient payriffClient;

    @Value("${currency.rates.usd-to-azn}")
    private BigDecimal usdToAznRate;

    @Value("${currency.rates.eur-to-azn}")
    private BigDecimal eurToAznRate;

    @Override
    @Transactional
    public CheckoutResponse checkout(Long orderId, Long userId) {

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        // Sahiblik yoxlaması - başqasının order-i üçün ödəniş yarada bilməz
        if (!Objects.equals(order.getUser().getId(), userId)) {
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

        // ✅ Payriff üçün AZN məbləğinin hesablanması
        BigDecimal chargedAmountAzn = calculateAznAmount(order.getFinalPrice(), order.getCurrency());

        log.info("Processing checkout for order {}: Original = {} {}, Converted for PayRiff = {} AZN (USD Rate: {}, EUR Rate: {})",
                order.getId(), order.getFinalPrice(), order.getCurrency(), chargedAmountAzn, usdToAznRate, eurToAznRate);

        String callbackUrlWithToken = payriffProperties.getCallbackUrl()
                + "?token=" + payriffProperties.getCallbackToken();

        // ✅ Payriff-ə hər zaman AZN valyutası və hesablanmış AZN məbləği göndərilir
        PayriffCreateOrderRequest payriffRequest = PayriffCreateOrderRequest.builder()
                .amount(chargedAmountAzn)
                .language("AZ")
                .currency("AZN") // Payriff yalnız AZN qəbul edir
                .description("Order #" + order.getOrderNumber())
                .callbackUrl(callbackUrlWithToken)
                .cardSave(false)
                .operation("PURCHASE")
                .metadata(Map.of(
                        "orderId", String.valueOf(order.getId()),
                        "orderNumber", order.getOrderNumber(),
                        "originalAmount", order.getFinalPrice().toString(),
                        "originalCurrency", order.getCurrency().name()
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
        payment.setAmount(chargedAmountAzn); // Kartdan çıxılacaq real AZN məbləği
        payment.setCurrency(Enums.Currency.AZN);
        payment.setStatus(Enums.PaymentStatus.WAITING);
        payment.setRawResponse(toJson(response));
        payment.setCreatedAt(payment.getCreatedAt() != null ? payment.getCreatedAt() : LocalDateTime.now());
        payment.setOrder(order);

        paymentRepository.save(payment);
        order.setPayment(payment);
        orderRepository.save(order);

        log.info("PayRiff checkout created: orderId={}, providerOrderId={}, chargedAzn={}",
                order.getId(), payload.getOrderId(), chargedAmountAzn);

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .providerOrderId(payload.getOrderId())
                .paymentUrl(payload.getPaymentUrl())
                .build();
    }

    @Override
    @Transactional
    public void handleCallback(PayriffCallbackPayload callbackPayload) {
        String resolvedOrderId = callbackPayload.getResolvedOrderId();
        if (resolvedOrderId == null) {
            log.warn("PayRiff callback received without orderId, ignoring. payload={}", callbackPayload);
            return;
        }

        Payment payment = paymentRepository.findByProviderPaymentId(resolvedOrderId)
                .orElseThrow(() -> new NotFoundException(
                        "Payment not found for PayRiff orderId: " +resolvedOrderId));

        Order order = payment.getOrder();

        // 1. Idempotency: Əgər sifariş artıq SUCCESS olubsa, təkrar emal etmə
        if (payment.getStatus() == Enums.PaymentStatus.SUCCESS) {
            log.info("Callback ignored, payment already SUCCESS. orderId={}", order.getId());
            return;
        }

        // 2. İKİQAT TƏSDİQ (Double Check): Payriff serverinə birbaşa GET /orders/{orderId} sorğusu atırıq
        PayriffResponse<PayriffOrderInfoPayload> confirmedResponse =
                payriffClient.getOrderInformation(payment.getProviderPaymentId());

        if (!confirmedResponse.isSuccess() || confirmedResponse.getPayload() == null) {
            log.error("PayRiff order verification failed for orderId={}", resolvedOrderId);
            throw new PaymentFailedException("Ödəniş Payriff tərəfindən təsdiqlənmədi");
        }

        PayriffOrderInfoPayload infoPayload = confirmedResponse.getPayload();

        // Rəsmi təsdiq cavabını audit üçün saxlayırıq
        payment.setRawResponse(toJson(confirmedResponse));

        // Təsdiqlənmiş statusu alırıq (Payriff-in "paymentStatus" sahəsi)
        String verifiedStatus = infoPayload.getPaymentStatus() != null
                ? infoPayload.getPaymentStatus().toUpperCase()
                : "";

        // 3. ENUM XƏRİTƏLƏNMƏSİ VƏ BİZNES MƏNTİQİ
        switch (verifiedStatus) {
            case "PAID", "APPROVED", "PREAUTH_APPROVED" -> {
                payment.setStatus(Enums.PaymentStatus.SUCCESS);
                payment.setConfirmedAt(LocalDateTime.now());

                order.setPaymentStatus(Enums.PaymentStatus.SUCCESS);
                if (order.getStatus().canTransitionTo(Enums.OrderStatus.PAID)) {
                    order.setStatus(Enums.OrderStatus.PAID);
                    order.setPaidAt(LocalDateTime.now());
                }
                log.info("Payment SUCCESS confirmed directly by PayRiff for order {}", order.getId());
            }
            case "DECLINED", "EXPIRED" -> {
                payment.setStatus(Enums.PaymentStatus.FAILED);
                order.setPaymentStatus(Enums.PaymentStatus.FAILED);
                log.info("Payment FAILED confirmed for order {} (status={})", order.getId(), verifiedStatus);
            }
            case "CANCELED" -> {
                payment.setStatus(Enums.PaymentStatus.CANCELLED);
                order.setPaymentStatus(Enums.PaymentStatus.CANCELLED);
                log.info("Payment CANCELLED confirmed for order {}", order.getId());
            }
            case "REFUNDED", "REVERSE", "PARTIAL_REFUND" -> {
                payment.setStatus(Enums.PaymentStatus.REFUNDED);
                order.setPaymentStatus(Enums.PaymentStatus.REFUNDED);
                log.info("Payment REFUNDED confirmed for order {}", order.getId());
            }
            default -> log.warn("Unknown PayRiff verified status '{}' for order {}", verifiedStatus, order.getId());
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    // 🛠️ Məzənnəyə uyğun AZN məbləğini hesablayan köməkçi metod
    private BigDecimal calculateAznAmount(BigDecimal amount, Enums.Currency currency) {
        if (amount == null) {
            return BigDecimal.ZERO;
        }

        if (currency == Enums.Currency.USD) {
            return amount.multiply(usdToAznRate).setScale(2, RoundingMode.HALF_UP);
        } else if (currency == Enums.Currency.EUR) {
            return amount.multiply(eurToAznRate).setScale(2, RoundingMode.HALF_UP);
        } else {
            return amount.setScale(2, RoundingMode.HALF_UP); // Artıq AZN-dir
        }
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

