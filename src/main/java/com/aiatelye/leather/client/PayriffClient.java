package com.aiatelye.leather.client;

import com.aiatelye.leather.config.PayriffProperties;
import com.aiatelye.leather.dto.payment.PayriffCreateOrderRequest;
import com.aiatelye.leather.dto.payment.PayriffOrderInfoPayload;
import com.aiatelye.leather.dto.payment.PayriffOrderPayload;
import com.aiatelye.leather.dto.payment.PayriffResponse;
import com.aiatelye.leather.error.Exception.PaymentFailedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

/**
 * PayRiff Gateway API V3 ile her bir HTTP cagirisini hayata kecirir.
 * Bu sinif ayrica cixarilib ki, PaymentServiceImpl test edilerken
 * RestClient zəncirini (chain) mock etmek evezine, bu interfeysi tek bir
 * metod kimi mock etmek kifayet etsin.
 *////
@Slf4j
@Component
public class PayriffClient {

    private final PayriffProperties payriffProperties;
    private final RestClient restClient;

    public PayriffClient(PayriffProperties payriffProperties, RestClient.Builder restClientBuilder) {
        this.payriffProperties = payriffProperties;
        this.restClient = restClientBuilder.build();
    }

    public PayriffResponse<PayriffOrderPayload> createOrder(PayriffCreateOrderRequest request) {
        try {
            return restClient.post()
                    .uri(payriffProperties.getBaseUrl() + "/orders")
                    .header("Authorization", payriffProperties.getSecretKey())
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<PayriffResponse<PayriffOrderPayload>>() {});
        } catch (RestClientResponseException e) {
            log.error("PayRiff API error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new PaymentFailedException("PayRiff API error: " + e.getStatusCode());
        }
    }

    /**
     * Payriff V3 API - Ödənişin statusunu və tranzaksiya detallarını birbaşa Payriff serverindən yoxlayır
     * GET /api/v3/orders/{orderId}
     */
    public PayriffResponse<PayriffOrderInfoPayload> getOrderInformation(String payriffOrderId) {
        try {
            return restClient.get()
                    .uri(payriffProperties.getBaseUrl() + "/orders/" + payriffOrderId)
                    .header("Authorization", payriffProperties.getSecretKey())
                    .retrieve()
                    .body(new ParameterizedTypeReference<PayriffResponse<PayriffOrderInfoPayload>>() {});
        } catch (RestClientResponseException e) {
            log.error("PayRiff getOrderInformation error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new PaymentFailedException("PayRiff status təsdiqləmə xətası: " + e.getStatusCode());
        }
    }
}
