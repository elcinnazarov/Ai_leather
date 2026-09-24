package com.aiatelye.leather.dto.payment;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

/**
 * PayRiff ödəniş tamamlandıqda callbackUrl-ə POST edir.
 * Sənədlərdə dəqiq sxem göstərilməyib, ona görə ən çox rast gəlinən
 * sahələri tuturuq, qalanını "metadata" və naməlum sahə kimi rahatca genişləndirə bilərik.
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class PayriffCallbackPayload {

    // ==========================================
    // 1. ƏSAS EYNİLƏŞDİRMƏ VƏ STATUS SAHƏLƏRİ
    // ==========================================
    @JsonAlias({"orderId", "order_id", "orderNumber"})
    private String orderId;

    @JsonAlias({"paymentStatus", "orderStatus", "status"})
    private String status;

    private String responseCode;
    private String responseDescription;

    // ==========================================
    // 2. MƏBLƏĞ VƏ VALYUTA (Payriff mütləq göndərir)
    // ==========================================
    @JsonAlias({"amount", "totalAmount"})
    private BigDecimal amount;

    @JsonAlias({"currency", "currencyType"})
    private String currency;

    // ==========================================
    // 3. KART VƏ TRANZAKSİYA DETALLARI
    // ==========================================
    private String rrn;
    private String pan;
    private String cardUuid;
    private String transactionId;
    private Map<String, String> metadata;

    // ==========================================
    // 4. ƏGƏR PAYRIFF MƏLUMATLARI "payload" VƏ YA "body" İÇİNDƏ GÖNDƏRƏRSƏ
    // ==========================================
    @JsonProperty("payload")
    private PayriffOrderInfoPayload payload;

    @JsonProperty("body")
    private PayriffOrderInfoPayload body;

    // ==========================================
    // KÖMƏKÇİ (RESOLVER) METODLAR
    // ==========================================

    /**
     * İstər kökdən, istər nested payload-dan Order ID-ni təhlükəsiz oxuyur
     */
    public String getResolvedOrderId() {
        if (this.orderId != null && !this.orderId.isBlank()) return this.orderId;
        if (this.payload != null && this.payload.getOrderId() != null) return this.payload.getOrderId();
        if (this.body != null && this.body.getOrderId() != null) return this.body.getOrderId();
        return null;
    }

    /**
     * İstər kökdən, istər nested payload-dan Statusu təhlükəsiz oxuyur
     */
    public String getResolvedStatus() {
        if (this.status != null && !this.status.isBlank()) return this.status.toUpperCase();
        if (this.payload != null && this.payload.getPaymentStatus() != null) return this.payload.getPaymentStatus().toUpperCase();
        if (this.body != null && this.body.getPaymentStatus() != null) return this.body.getPaymentStatus().toUpperCase();
        return null;
    }

    /**
     * Məbləği həm kökdən, həm də daxili payload-dan təhlükəsiz oxuyur
     */
    public BigDecimal getResolvedAmount() {
        if (this.amount != null) return this.amount;
        if (this.payload != null && this.payload.getAmount() != null) return this.payload.getAmount();
        if (this.body != null && this.body.getAmount() != null) return this.body.getAmount();
        return null;
    }

    /**
     * Valyutanı həm kökdən, həm də daxili payload-dan oxuyur
     */
    public String getResolvedCurrency() {
        if (this.currency != null && !this.currency.isBlank()) return this.currency;
        if (this.payload != null && this.payload.getCurrencyType() != null) return this.payload.getCurrencyType();
        if (this.body != null && this.body.getCurrencyType() != null) return this.body.getCurrencyType();
        return "AZN";
    }
}