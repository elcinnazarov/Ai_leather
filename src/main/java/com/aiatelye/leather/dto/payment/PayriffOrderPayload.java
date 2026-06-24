package com.aiatelye.leather.dto.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

/**
 * PayRiff "Create Order" payload-u.
 * PayRiff bəzi sahələri fərqli adlandıra bilər (orderId/paymentUrl),
 * ona görə JsonIgnoreProperties(ignoreUnknown = true) ilə qoruyuruq.
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class PayriffOrderPayload {

    private String orderId;       // PayRiff-in verdiyi unikal sifariş ID-si
    private String paymentUrl;    // Müştərinin yönləndiriləcəyi ödəniş səhifəsi linki
    private String sessionId;
    private String transactionId;
}
