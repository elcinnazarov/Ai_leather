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
import java.util.HashMap;

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

    @Value("${currency.rates.usd-to-azn:1.70}")
    private BigDecimal usdToAznRate;

    @Value("${currency.rates.eur-to-azn:1.85}")
    private BigDecimal eurToAznRate;

    @Override
    @Transactional
    public CheckoutResponse checkout(Long orderId, Long userId) {

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        // 1. Sahiblik yoxlaması - başqasının order-i üçün ödəniş yarada bilməz
        if (!Objects.equals(order.getUser().getId(), userId)) {
            throw new BadRequestException("This order does not belong to you");
        }

        // 2. Yalnız PENDING statuslu order üçün checkout açıla bilər
        if (order.getStatus() != Enums.OrderStatus.PENDING) {
            throw new BadRequestException("Order is not payable, current status: " + order.getStatus());
        }

        // 3. Artıq uğurlu ödəniş varsa, təkrar checkout açma (idempotent davranış)
        if (order.getPaymentStatus() == Enums.PaymentStatus.SUCCESS) {
            throw new BadRequestException("Order is already paid");
        }

        // 4. ✅ Bütün valyutaların (USD, EUR, AZN) Payriff üçün AZN məbləğinə çevrilməsi
        // Və dilin hər kəs üçün "EN" təyin edilməsi
        PaymentChargeDetails chargeDetails = resolveChargeDetails(order.getFinalPrice(), order.getCurrency());

        log.info("Processing checkout for order {}: Original = {} {}, Sending to PayRiff = {} {} (Language: {})",
                order.getId(), order.getFinalPrice(), order.getCurrency(),
                chargeDetails.amount(), chargeDetails.currencyCode(), chargeDetails.language());

        String callbackUrlWithToken = payriffProperties.getCallbackUrl()
                + "?token=" + payriffProperties.getCallbackToken();

        // 5. Metadata xəritəsi (NullPointerException-dan qorunmuş)
        Map<String, String> metadata = new HashMap<>();
        metadata.put("orderId", String.valueOf(order.getId()));
        metadata.put("orderNumber", String.valueOf(order.getOrderNumber()));
        metadata.put("originalAmount", order.getFinalPrice() != null ? order.getFinalPrice().toString() : "0");
        metadata.put("originalCurrency", order.getCurrency() != null ? order.getCurrency().name() : "AZN");
        metadata.put("chargedAmount", chargeDetails.amount().toString());
        metadata.put("chargedCurrency", chargeDetails.currencyCode());

        // 6. ✅ Payriff sorğusunun formalaşdırılması: Həmişə AZN və Həmişə EN
        PayriffCreateOrderRequest payriffRequest = PayriffCreateOrderRequest.builder()
                .amount(chargeDetails.amount())
                .language(chargeDetails.language()) // Həmişə "EN"
                .currency(chargeDetails.currencyCode()) // Həmişə "AZN"
                .description("Order #" + order.getOrderNumber())
                .callbackUrl(callbackUrlWithToken)
                .cardSave(false)
                .operation("PURCHASE")
                .metadata(metadata)
                .build();

        PayriffResponse<PayriffOrderPayload> response = payriffClient.createOrder(payriffRequest);

        if (!response.isSuccess() || response.getPayload() == null
                || response.getPayload().getPaymentUrl() == null) {
            log.warn("PayRiff create-order failed for order {}: code={}, message={}, internalMessage={}",
                    order.getId(), response.getCode(), response.getMessage(), response.getInternalMessage());
            throw new PaymentFailedException("Payment provider did not return a payment URL");
        }

        PayriffOrderPayload payload = response.getPayload();

        // 7. Payment qeydini yarat və ya yenilə (Kartdan çıxılacaq real məbləğ və valyuta: AZN)
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(Payment::new);

        payment.setProvider("PAYRIFF");
        payment.setProviderPaymentId(payload.getOrderId());
        payment.setAmount(chargeDetails.amount()); // Real çıxılacaq AZN məbləği
        payment.setCurrency(chargeDetails.targetCurrencyEnum()); // Enums.Currency.AZN
        payment.setStatus(Enums.PaymentStatus.WAITING);
        payment.setRawResponse(toJson(response));
        payment.setCreatedAt(payment.getCreatedAt() != null ? payment.getCreatedAt() : LocalDateTime.now());
        payment.setOrder(order);

        paymentRepository.save(payment);
        order.setPayment(payment);
        orderRepository.save(order);

        log.info("PayRiff checkout created: orderId={}, providerOrderId={}, charged = {} {}",
                order.getId(), payload.getOrderId(), chargeDetails.amount(), chargeDetails.currencyCode());

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
                        "Payment not found for PayRiff orderId: " + resolvedOrderId));

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

        log.info("Processing callback verification for order {}: Payriff status = '{}'", order.getId(), verifiedStatus);

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
            case "DECLINED", "EXPIRED", "FAILED", "REJECTED" -> {
                payment.setStatus(Enums.PaymentStatus.FAILED);
                order.setPaymentStatus(Enums.PaymentStatus.FAILED);
                log.info("Payment FAILED confirmed for order {} (status={})", order.getId(), verifiedStatus);
            }
            case "CANCELED", "CANCELLED" -> {
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

    // 🛠️ Bütün valyutaları AZN-ə hesablayan və dili HƏMİŞƏ "EN" edən köməkçi record və metod
    private record PaymentChargeDetails(
            BigDecimal amount,
            String currencyCode,
            Enums.Currency targetCurrencyEnum,
            String language
    ) {}

    private PaymentChargeDetails resolveChargeDetails(BigDecimal price, Enums.Currency currency) {
        BigDecimal basePrice = price != null ? price : BigDecimal.ZERO;
        String defaultLanguage = "EN"; // ✅ Bütün ödəniş linkləri İngilis dilində açılır

        if (currency == Enums.Currency.USD) {
            // ✅ USD -> AZN məzənnəsi ilə vurulur
            BigDecimal convertedAzn = basePrice.multiply(usdToAznRate).setScale(2, RoundingMode.HALF_UP);
            return new PaymentChargeDetails(
                    convertedAzn,
                    "AZN",
                    Enums.Currency.AZN,
                    defaultLanguage
            );
        } else if (currency == Enums.Currency.EUR) {
            // ✅ EUR -> AZN məzənnəsi ilə vurulur
            BigDecimal convertedAzn = basePrice.multiply(eurToAznRate).setScale(2, RoundingMode.HALF_UP);
            return new PaymentChargeDetails(
                    convertedAzn,
                    "AZN",
                    Enums.Currency.AZN,
                    defaultLanguage
            );
        } else {
            // ✅ Standart AZN
            return new PaymentChargeDetails(
                    basePrice.setScale(2, RoundingMode.HALF_UP),
                    "AZN",
                    Enums.Currency.AZN,
                    defaultLanguage
            );
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