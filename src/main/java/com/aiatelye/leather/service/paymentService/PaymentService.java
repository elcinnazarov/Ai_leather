package com.aiatelye.leather.service.paymentService;

import com.aiatelye.leather.dto.payment.CheckoutResponse;
import com.aiatelye.leather.dto.payment.PayriffCallbackPayload;

public interface PaymentService {

    /**
     * 1. Klassik Bank Kartı ilə Ödəniş (Standart ePoint /request)
     * Paşa Bankın rəsmi ödəniş səhifəsinə keçid linkini generasiya edir.
     *
     * @param orderId Sifarişin unikal ID-si
     * @param userId  Sifariş sahibi olan istifadəçinin ID-si
     * @return CheckoutResponse (ödəniş linki və providerOrderId)
     */
    CheckoutResponse checkout(Long orderId, Long userId);

    /**
     * 2. Apple Pay & Google Pay ilə Ödəniş (ePoint Token Widget)
     * Apple Pay və Google Pay dəstəkli vahid widget səhifəsinin linkini generasiya edir.
     *
     * @param orderId Sifarişin unikal ID-si
     * @param userId  Sifariş sahibi olan istifadəçinin ID-si
     * @return CheckoutResponse (widget_url və providerOrderId)
     */
    CheckoutResponse checkoutWithWidget(Long orderId, Long userId);

    /**
     * 3. ePoint Webhook Callback emalı
     * ePoint serverindən gələn imzalanmış nəticəni qəbul edir,
     * statusu təsdiqləyir və bazada Order/Payment statuslarını SUCCESS/PAID edir.
     *
     * @param data      ePoint tərəfindən göndərilən Base64 JSON məlumatı
     * @param signature ePoint-in SHA-1 rəqəmsal imzası
     */
    void handleEpointCallback(String data, String signature);



    // 3. American Express (AMEX) ödənişi
    CheckoutResponse checkoutAmex(Long orderId, Long userId);

    /**
     * 4. Köhnə Payriff Callback emalı (Arxiv)
     * Geriye uyğunluq (backward compatibility) üçün saxlanılır.
     *
     * @param callbackPayload Payriff-dən gələn callback modeli
     */
    void handleCallback(PayriffCallbackPayload callbackPayload);
}
