package com.aiatelye.leather.service.paymentService;
import com.aiatelye.leather.client.EpointClient;
import com.aiatelye.leather.client.PayriffClient;
import com.aiatelye.leather.dao.Order;
import com.aiatelye.leather.dao.Payment;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.dto.payment.*;
import com.aiatelye.leather.dto.payment.Epoint.*;
import com.aiatelye.leather.error.Exception.BadRequestException;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.error.Exception.PaymentFailedException;
import com.aiatelye.leather.repository.OrderRepository;
import com.aiatelye.leather.repository.PaymentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ObjectMapper objectMapper;
    private final EpointClient epointClient;
    private final PayriffClient payriffClient; // Arxiv kimi saxlanılır
    @Value("${currency.rates.usd-to-azn:1.70}")
    private BigDecimal usdToAznRate;

    @Value("${currency.rates.eur-to-azn:1.9765}")
    private BigDecimal eurToAznRate;
    // Paşa Bank ödəniş sessiyasının ömrü (15 dəqiqə)
    private static final int PAYMENT_SESSION_TIMEOUT_MINUTES = 15;

   /* @Override
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

        Optional<Payment> existingPaymentOpt = paymentRepository.findByOrderId(order.getId());
        boolean isNewAttemptRequired = false;

        // =========================================================================
        // 🔹 HAL 1: Əgər link son 15 dəqiqədə yaradılıbsa və WAITING-dirsə -> AKTİV LİNKİ VER
        // =========================================================================
        if (existingPaymentOpt.isPresent()) {
            Payment existingPayment = existingPaymentOpt.get();

            boolean isLinkFresh = existingPayment.getCreatedAt() != null
                    && existingPayment.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(PAYMENT_SESSION_TIMEOUT_MINUTES));

            if (existingPayment.getStatus() == Enums.PaymentStatus.WAITING && isLinkFresh) {
                String cachedUrl = extractRedirectUrl(existingPayment);
                if (cachedUrl != null && !cachedUrl.isBlank()) {
                    log.info("Hal 1: Order #{} üçün mövcud aktiv ödəniş linki qaytarılır (transaction: {})",
                            order.getId(), existingPayment.getProviderPaymentId());

                    return CheckoutResponse.builder()
                            .orderId(order.getId())
                            .providerOrderId(existingPayment.getProviderPaymentId())
                            .paymentUrl(cachedUrl)
                            .build();
                }
            }

            // 15 dəqiqə keçibsə və ya ödəniş uğursuz olubsa -> Yeni ePoint sorğusu tələb olunur
            isNewAttemptRequired = true;
        }

        // 4. Valyuta və məbləğ təyini (USD, EUR, AZN birbaşa)
        Enums.Currency orderCurrency = order.getCurrency() != null ? order.getCurrency() : Enums.Currency.AZN;
        BigDecimal chargeAmount = order.getFinalPrice() != null
                ? order.getFinalPrice().setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String currencyCode = orderCurrency.name();
        String language = "en";

        // =========================================================================
        // 🔹 HAL 2: 15 dəqiqə keçibsə, zamana bağlı unikal ID yaradılır (heç vaxt Duplicate vermir)
        // =========================================================================
        String uniqueOrderId = isNewAttemptRequired
                ? order.getId() + "_" + (System.currentTimeMillis() / 1000)
                : String.valueOf(order.getId());

        log.info("Sending checkout to ePoint for Order #{}: epoint_order_id={}, Amount = {} {}",
                order.getId(), uniqueOrderId, chargeAmount, currencyCode);

        // 5. ePoint sorğusunun formalaşdırılması
        EpointPaymentRequest epointRequest = EpointPaymentRequest.builder()
                .amount(chargeAmount)
                .currency(currencyCode)
                .language(language)
                .orderId(uniqueOrderId) // ✅ 1-ci dəfə "12", sonrakı dəfə "12_1728641200"
                .description("Order #" + order.getOrderNumber() + " - E1000 Leather Atelier")
                .build();

        EpointPaymentResponse response = epointClient.createPayment(epointRequest);

        if (!response.isSuccess() || response.getRedirectUrl() == null) {
            log.error("ePoint create payment failed for order {}: message={}, traceId={}",
                    order.getId(), response.getMessage(), response.getTraceId());
            throw new PaymentFailedException("ePoint payment URL alına bilmədi: " + response.getMessage());
        }

        // 6. Payment qeydini bazada yarat və ya yenilə
        Payment payment = existingPaymentOpt.orElseGet(Payment::new);

        payment.setProvider("EPOINT");
        payment.setProviderPaymentId(response.getTransaction());
        payment.setAmount(chargeAmount);
        payment.setCurrency(orderCurrency);
        payment.setStatus(Enums.PaymentStatus.WAITING);
        payment.setRawResponse(toJson(response));
        payment.setCreatedAt(LocalDateTime.now()); // ✅ Yeni cəhdin vaxtı yenilənir
        payment.setOrder(order);

        paymentRepository.save(payment);
        order.setPayment(payment);
        orderRepository.save(order);

        log.info("ePoint checkout created: orderId={}, transactionId={}, redirectUrl={}",
                order.getId(), response.getTransaction(), response.getRedirectUrl());

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .providerOrderId(response.getTransaction())
                .paymentUrl(response.getRedirectUrl())
                .build();
    }*/
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

       Optional<Payment> existingPaymentOpt = paymentRepository.findByOrderId(order.getId());
       boolean isNewAttemptRequired = false;

       // =========================================================================
       // 🔹 HAL 1: Əgər link son 15 dəqiqədə yaradılıbsa və WAITING-dirsə -> AKTİV LİNKİ VER
       // =========================================================================
       if (existingPaymentOpt.isPresent()) {
           Payment existingPayment = existingPaymentOpt.get();

           boolean isLinkFresh = existingPayment.getCreatedAt() != null
                   && existingPayment.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(PAYMENT_SESSION_TIMEOUT_MINUTES));

           if (existingPayment.getStatus() == Enums.PaymentStatus.WAITING && isLinkFresh) {
               String cachedUrl = extractRedirectUrl(existingPayment);
               if (cachedUrl != null && !cachedUrl.isBlank()) {
                   log.info("Hal 1: Order #{} üçün mövcud aktiv ödəniş linki qaytarılır (transaction: {})",
                           order.getId(), existingPayment.getProviderPaymentId());

                   return CheckoutResponse.builder()
                           .orderId(order.getId())
                           .providerOrderId(existingPayment.getProviderPaymentId())
                           .paymentUrl(cachedUrl)
                           .build();
               }
           }

           // 15 dəqiqə keçibsə və ya ödəniş uğursuz olubsa -> Yeni ePoint sorğusu tələb olunur
           isNewAttemptRequired = true;
       }

       // =========================================================================
       // 🔹 4. VALYUTA VƏ MƏBLƏĞ TƏYİNİ:
       // Currency nə gəlibsə (USD, EUR, AZN) birbaşa o gedir!
       // Amount isə USD olduqda 1.70-ə, EUR olduqda 1.9765-ə vurulur, AZN olduqda birbaşa öz qiyməti qalır.
       // =========================================================================
       Enums.Currency orderCurrency = order.getCurrency() != null ? order.getCurrency() : Enums.Currency.AZN;
       String currencyCode = orderCurrency.name(); // ✅ NƏ GƏLİBSƏ O GEDİR: "USD", "EUR", "AZN"
       BigDecimal chargeAmount = calculateChargeAmount(order.getFinalPrice(), orderCurrency);
       String language = "en"; // Xarici müştərilər üçün İngilis dili

       log.info("Order #{} payment charge: Original = {} {}, Sending to ePoint = {} {} (Language: {})",
               order.getId(), order.getFinalPrice(), order.getCurrency(), chargeAmount, currencyCode, language);

       // =========================================================================
       // 🔹 HAL 2: 15 dəqiqə keçibsə, zamana bağlı unikal ID yaradılır (heç vaxt Duplicate vermir)
       // =========================================================================
       String uniqueOrderId = isNewAttemptRequired
               ? order.getId() + "_" + (System.currentTimeMillis() / 1000)
               : String.valueOf(order.getId());

       // 5. ePoint sorğusunun formalaşdırılması (/payment-request)
       EpointPaymentRequest epointRequest = EpointPaymentRequest.builder()
               .amount(chargeAmount)
               .currency(currencyCode) // ✅ Sifarişin öz valyutası (USD / EUR / AZN)
               .language(language)
               .orderId(uniqueOrderId)
               .description("Order #" + order.getOrderNumber() + " - E1000 Leather Atelier")
               .build();

       EpointPaymentResponse response = epointClient.createPayment(epointRequest);

       if (!response.isSuccess() || response.getRedirectUrl() == null) {
           log.error("ePoint payment-request failed for order {}: message={}, traceId={}",
                   order.getId(), response.getMessage(), response.getTraceId());
           throw new PaymentFailedException("ePoint payment URL alına bilmədi: " + response.getMessage());
       }

       // 6. DB: Payment qeydini yarat və ya yenilə
       Payment payment = existingPaymentOpt.orElseGet(Payment::new);

       payment.setProvider("EPOINT");
       payment.setProviderPaymentId(response.getTransaction());
       payment.setAmount(chargeAmount);
       payment.setCurrency(orderCurrency); // Real valyuta DB-də qorunur
       payment.setStatus(Enums.PaymentStatus.WAITING);
       payment.setRawResponse(toJson(response));
       payment.setCreatedAt(LocalDateTime.now());
       payment.setOrder(order);

       paymentRepository.save(payment);
       order.setPayment(payment);
       orderRepository.save(order);

       log.info("ePoint payment-request successfully created: orderId={}, transactionId={}, redirectUrl={}",
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

        // 3. Verilənlər bazasından ödənişi əvvəlcə transactionId ilə axtarırıq
        Payment payment = paymentRepository.findByProviderPaymentId(callbackData.getTransaction())
                .orElse(null);

        // Əgər tapılmadısa, order_id-dən "12_1728641200" olsa belə "12" çıxarıb bazadan tapırıq:
        if (payment == null && callbackData.getOrderId() != null) {
            try {
                String cleanOrderId = callbackData.getOrderId().split("_")[0];
                payment = paymentRepository.findByOrderId(Long.parseLong(cleanOrderId)).orElse(null);
            } catch (Exception ignored) {}
        }

        if (payment == null) {
            throw new NotFoundException("Payment not found for transaction: " + callbackData.getTransaction());
        }

        Order order = payment.getOrder();

        // 4. Idempotency: Əgər artıq SUCCESS-dirsə təkrar etmə
        if (payment.getStatus() == Enums.PaymentStatus.SUCCESS) {
            log.info("Callback ignored: Payment already SUCCESS for orderId={}", order.getId());
            return;
        }

        // 5. İKİQAT TƏSDİQ (Double Check): ePoint serverindən statusu bir daha yoxlayırıq
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


    /**
     * Apple Pay & Google Pay (Token Widget) ilə ödəniş sessiyası yaradır.
     * Mövcud checkout() metodunuza qətiyyən toxunmur.
     */
    @Transactional
    public CheckoutResponse checkoutWithWidget(Long orderId, Long userId) {

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        if (!Objects.equals(order.getUser().getId(), userId)) {
            throw new BadRequestException("This order does not belong to you");
        }

        if (order.getStatus() != Enums.OrderStatus.PENDING) {
            throw new BadRequestException("Order is not payable, current status: " + order.getStatus());
        }

        if (order.getPaymentStatus() == Enums.PaymentStatus.SUCCESS) {
            throw new BadRequestException("Order is already paid");
        }

        // Hal 1: Əgər 15 dəqiqə ərzində aktiv widget linki varsa, həmin linki qaytarırıq
        Optional<Payment> existingPaymentOpt = paymentRepository.findByOrderId(order.getId());
        if (existingPaymentOpt.isPresent()) {
            Payment existingPayment = existingPaymentOpt.get();
            boolean isLinkFresh = existingPayment.getCreatedAt() != null
                    && existingPayment.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(PAYMENT_SESSION_TIMEOUT_MINUTES));

            if (existingPayment.getStatus() == Enums.PaymentStatus.WAITING && isLinkFresh) {
                String cachedUrl = extractRedirectUrl(existingPayment);
                if (cachedUrl != null && !cachedUrl.isBlank()) {
                    log.info("Returning active Token Widget URL for order {}", order.getId());
                    return CheckoutResponse.builder()
                            .orderId(order.getId())
                            .providerOrderId(existingPayment.getProviderPaymentId())
                            .paymentUrl(cachedUrl)
                            .build();
                }
            }
        }

        // Valyuta və məbləğ
        Enums.Currency orderCurrency = order.getCurrency() != null ? order.getCurrency() : Enums.Currency.AZN;
        BigDecimal chargeAmount = order.getFinalPrice() != null
                ? order.getFinalPrice().setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String currencyCode = orderCurrency.name();
        String language = "en";

        // Hal 2: Təzə sorğu üçün zamana bağlı unikal ID
        String uniqueOrderId = existingPaymentOpt.isPresent()
                ? order.getId() + "_" + (System.currentTimeMillis() / 1000)
                : String.valueOf(order.getId());

        EpointPaymentRequest epointRequest = EpointPaymentRequest.builder()
                .amount(chargeAmount)
                .currency(currencyCode)
                .language(language)
                .orderId(uniqueOrderId)
                .description("Order #" + order.getOrderNumber() + " - E1000 Leather Atelier")
                .build();

        // 🔹 Token Widget (Apple Pay / Google Pay) çağırılır
        EpointWidgetResponse response = epointClient.createTokenWidget(epointRequest);

        if (!response.isSuccess() || response.getWidgetUrl() == null) {
            log.error("ePoint Token Widget failed for order {}: message={}",
                    order.getId(), response.getMessage());
            throw new PaymentFailedException("Token Widget linki alına bilmədi: " + response.getMessage());
        }

        // Bazada Payment qeydinin saxlanılması
        Payment payment = existingPaymentOpt.orElseGet(Payment::new);
        payment.setProvider("EPOINT_WIDGET");
        payment.setProviderPaymentId(response.getTransaction() != null ? response.getTransaction() : uniqueOrderId);
        payment.setAmount(chargeAmount);
        payment.setCurrency(orderCurrency);
        payment.setStatus(Enums.PaymentStatus.WAITING);
        payment.setRawResponse(toJson(response));
        payment.setCreatedAt(LocalDateTime.now());
        payment.setOrder(order);

        paymentRepository.save(payment);
        order.setPayment(payment);
        orderRepository.save(order);

        log.info("ePoint Token Widget created: orderId={}, widgetUrl={}", order.getId(), response.getWidgetUrl());

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .providerOrderId(payment.getProviderPaymentId())
                .paymentUrl(response.getWidgetUrl())
                .build();
    }




    /**
     * 3. American Express (AMEX) ilə ödəniş axını
     * Bütün biznes məntiqləri, mülkiyyət yoxlamaları və sessiya müddəti tam qorunur.
     */
    @Override
    @Transactional
    public CheckoutResponse checkoutAmex(Long orderId, Long userId) {

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

        Optional<Payment> existingPaymentOpt = paymentRepository.findByOrderId(order.getId());
        boolean isNewAttemptRequired = false;

        // 🔹 HAL 1: Əgər son 15 dəqiqə ərzində yaradılmış aktiv AMEX linki varsa -> Təkrar sorğu atmır, aktiv linki verir
        if (existingPaymentOpt.isPresent()) {
            Payment existingPayment = existingPaymentOpt.get();

            boolean isLinkFresh = existingPayment.getCreatedAt() != null
                    && existingPayment.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(PAYMENT_SESSION_TIMEOUT_MINUTES));

            if (existingPayment.getStatus() == Enums.PaymentStatus.WAITING && isLinkFresh) {
                String cachedUrl = extractRedirectUrl(existingPayment);
                if (cachedUrl != null && !cachedUrl.isBlank()) {
                    log.info("Hal 1 (AMEX): Order #{} üçün mövcud aktiv link qaytarılır: {}", order.getId(), cachedUrl);
                    return CheckoutResponse.builder()
                            .orderId(order.getId())
                            .providerOrderId(existingPayment.getProviderPaymentId())
                            .paymentUrl(cachedUrl)
                            .build();
                }
            }

            // 15 dəqiqə keçibsə -> Yeni sorğu tələb olunur
            isNewAttemptRequired = true;
        }

        // 4. Valyuta və məbləğ (USD, EUR, AZN birbaşa)
        Enums.Currency orderCurrency = order.getCurrency() != null ? order.getCurrency() : Enums.Currency.AZN;
        BigDecimal chargeAmount = order.getFinalPrice() != null
                ? order.getFinalPrice().setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String currencyCode = orderCurrency.name();
        String language = "en";

        // 🔹 HAL 2: Təkrar cəhddə Duplicate xətasından qoruyan unikal zaman ID-si
        String uniqueOrderId = isNewAttemptRequired
                ? order.getId() + "_" + (System.currentTimeMillis() / 1000)
                : String.valueOf(order.getId());

        log.info("Creating ePoint AMEX checkout for Order #{}: epoint_order_id={}, Amount = {} {}",
                order.getId(), uniqueOrderId, chargeAmount, currencyCode);

        // 5. ePoint AMEX sorğusunun formalaşdırılması
        EpointPaymentRequest amexRequest = EpointPaymentRequest.builder()
                .amount(chargeAmount)
                .currency(currencyCode)
                .language(language)
                .orderId(uniqueOrderId) // ✅ Heç vaxt Duplicate vermir
                .description("Order #" + order.getOrderNumber() + " - E1000 Leather Atelier (AMEX)")
                .build();

        EpointPaymentResponse response = epointClient.createAmexPayment(amexRequest);

        if (!response.isSuccess() || response.getRedirectUrl() == null) {
            log.error("ePoint AMEX payment failed for order {}: message={}, traceId={}",
                    order.getId(), response.getMessage(), response.getTraceId());
            throw new PaymentFailedException("AMEX ödəniş linki alına bilmədi: " + response.getMessage());
        }

        // 6. Payment qeydini yarat və ya yenilə
        Payment payment = existingPaymentOpt.orElseGet(Payment::new);

        payment.setProvider("EPOINT_AMEX");
        payment.setProviderPaymentId(response.getTransaction());
        payment.setAmount(chargeAmount);
        payment.setCurrency(orderCurrency);
        payment.setStatus(Enums.PaymentStatus.WAITING);
        payment.setRawResponse(toJson(response));
        payment.setCreatedAt(LocalDateTime.now());
        payment.setOrder(order);

        paymentRepository.save(payment);
        order.setPayment(payment);
        orderRepository.save(order);

        log.info("ePoint AMEX checkout successfully created: orderId={}, transactionId={}, redirectUrl={}",
                order.getId(), response.getTransaction(), response.getRedirectUrl());

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .providerOrderId(response.getTransaction())
                .paymentUrl(response.getRedirectUrl())
                .build();
    }


    // Köhnə Payriff üçün metod (arxiv kimi saxlanılır)
    @Override
    @Transactional
    public void handleCallback(PayriffCallbackPayload callbackPayload) {
        log.info("Legacy Payriff callback called.");
    }



    // 🛠️ MƏBLƏĞ HESABLAYICI KÖMƏKÇİ METOD
    private BigDecimal calculateChargeAmount(BigDecimal price, Enums.Currency currency) {
        BigDecimal basePrice = price != null ? price : BigDecimal.ZERO;

        if (currency == Enums.Currency.USD) {
            // USD olduqda 1.70 məzənnəsinə vurulur
            return basePrice.multiply(usdToAznRate).setScale(2, RoundingMode.HALF_UP);
        } else if (currency == Enums.Currency.EUR) {
            // EUR olduqda 1.9765 məzənnəsinə vurulur
            return basePrice.multiply(eurToAznRate).setScale(2, RoundingMode.HALF_UP);
        } else {
            // AZN olduqda birbaşa öz qiyməti qalır
            return basePrice.setScale(2, RoundingMode.HALF_UP);
        }
    }



    /**
     * Bazadakı rawResponse JSON-undan redirect_url-i 100% təhlükəsiz oxuyur (Tree parsing)
     */
    private String extractRedirectUrl(Payment payment) {
        if (payment.getRawResponse() == null || payment.getRawResponse().isBlank()) {
            return null;
        }
        try {
            JsonNode rootNode = objectMapper.readTree(payment.getRawResponse());
            if (rootNode.has("redirect_url")) {
                return rootNode.get("redirect_url").asText();
            }
        } catch (Exception e) {
            log.warn("Could not extract redirect_url from rawResponse: ", e);
        }
        return null;
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