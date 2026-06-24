package com.aiatelye.leather.service.paymentService;

import com.aiatelye.leather.dto.payment.CheckoutResponse;
import com.aiatelye.leather.dto.payment.PayriffCallbackPayload;

public interface PaymentService {

    /**
     * Movcud (PENDING) order ucun PayRiff-de odenis sessiyasi yaradir
     * ve mustərinin yonlendirilmeli oldugu paymentUrl-i qaytarir.
     */
    CheckoutResponse checkout(Long orderId, Long userId);

    /**
     * PayRiff callback (webhook) -dan gelen neticeni isleyir:
     * Payment ve Order statuslarini yenileyir.
     */
    void handleCallback(PayriffCallbackPayload payload);
}
