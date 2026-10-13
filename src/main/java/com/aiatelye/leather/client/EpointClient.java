package com.aiatelye.leather.client;
import com.aiatelye.leather.config.EpointProperties;
import com.aiatelye.leather.dto.payment.*;
import com.aiatelye.leather.dto.payment.Epoint.*;
import com.aiatelye.leather.error.Exception.PaymentFailedException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Slf4j
@Component
public class EpointClient {

    private final EpointProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public EpointClient(EpointProperties properties, RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.properties = properties;
        this.restClient = restClientBuilder.baseUrl(properties.getBaseUrl()).build();
        this.objectMapper = objectMapper;
    }


    /**
     * 1. ePoint Ödəniş Sorğusu (Apple Pay və Kart dəstəkli)
     * POST https://epoint.az/api/1/payment-request
     */
    public EpointPaymentResponse createPayment(EpointPaymentRequest request) {
        request.setPublicKey(properties.getPublicKey());
        request.setSuccessRedirectUrl(properties.getSuccessRedirectUrl());
        request.setErrorRedirectUrl(properties.getErrorRedirectUrl());

        try {
            String jsonPayload = objectMapper.writeValueAsString(request);
            log.info("ePoint Payment-Request göndərilən JSON: {}", jsonPayload);

            String data = Base64.getEncoder().encodeToString(jsonPayload.getBytes(StandardCharsets.UTF_8));
            String signature = generateSignature(data);

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("data", data);
            formData.add("signature", signature);

            return restClient.post()
                    .uri("/payment-request") // 🔹 Rəsmi /payment-request endpoint-i
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formData)
                    .retrieve()
                    .body(EpointPaymentResponse.class);

        } catch (JsonProcessingException e) {
            log.error("ePoint request JSON serialization error: ", e);
            throw new PaymentFailedException("Ödəniş sorğusu hazırlana bilmədi");
        } catch (RestClientResponseException e) {
            log.error("ePoint API error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new PaymentFailedException("ePoint API xətası: " + e.getStatusCode());
        }
    }


    /**
     * 1. Yeni Ödəniş Yaratma (POST /request)
     */
    /*public EpointPaymentResponse createPayment(EpointPaymentRequest request) {
        request.setPublicKey(properties.getPublicKey());
        request.setSuccessRedirectUrl(properties.getSuccessRedirectUrl());
        request.setErrorRedirectUrl(properties.getErrorRedirectUrl());

        try {
            String jsonPayload = objectMapper.writeValueAsString(request);
            String data = Base64.getEncoder().encodeToString(jsonPayload.getBytes(StandardCharsets.UTF_8));
            String signature = generateSignature(data);

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("data", data);
            formData.add("signature", signature);
            log.info("ePoint göndərilən real JSON: {}", jsonPayload);
            return restClient.post()
                    .uri("/request")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formData)
                    .retrieve()
                    .body(EpointPaymentResponse.class);

        } catch (JsonProcessingException e) {
            log.error("ePoint request JSON serialization error: ", e);
            throw new PaymentFailedException("Ödəniş sorğusu hazırlana bilmədi");
        } catch (RestClientResponseException e) {
            log.error("ePoint API error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new PaymentFailedException("ePoint API xətası: " + e.getStatusCode());
        }

    }*/

    /**
     * 2. Ödənişin Statusunu Yoxlamaq (POST /get-status)
     */
    public EpointStatusResponse getStatus(String transactionId) {
        EpointStatusRequest request = EpointStatusRequest.builder()
                .publicKey(properties.getPublicKey())
                .transaction(transactionId)
                .build();

        try {
            String jsonPayload = objectMapper.writeValueAsString(request);
            String data = Base64.getEncoder().encodeToString(jsonPayload.getBytes(StandardCharsets.UTF_8));
            String signature = generateSignature(data);

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("data", data);
            formData.add("signature", signature);

            return restClient.post()
                    .uri("/get-status")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formData)
                    .retrieve()
                    .body(EpointStatusResponse.class);

        } catch (Exception e) {
            log.error("ePoint get-status error for transaction {}: ", transactionId, e);
            throw new PaymentFailedException("ePoint status yoxlama xətası");
        }
    }

    /**
     * ePoint SHA-1 Binary Digest İmzası:
     * SIGNATURE = Base64( SHA-1_raw( PRIVATE_KEY + DATA + PRIVATE_KEY ) )
     */
    public String generateSignature(String data) {
        try {
            String toSign = properties.getPrivateKey() + data + properties.getPrivateKey();
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] sha1Binary = md.digest(toSign.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(sha1Binary);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-1 alqoritmi tapılmadı", e);
        }
    }

    /**
     * Callback gəldikdə gələn imzanı yoxlayır
     */
    public boolean verifySignature(String data, String incomingSignature) {
        if (data == null || incomingSignature == null) return false;
        String calculated = generateSignature(data);
        return calculated.equals(incomingSignature);
    }

    /**
     * Base64 data-nı DTO-ya çevirir
     */
    public EpointCallbackData parseCallbackData(String base64Data) {
        try {
            byte[] decodedBytes = Base64.getDecoder().decode(base64Data);
            String json = new String(decodedBytes, StandardCharsets.UTF_8);
            return objectMapper.readValue(json, EpointCallbackData.class);
        } catch (Exception e) {
            log.error("Failed to parse ePoint callback base64 data", e);
            return null;
        }
    }

    /**
     * Apple Pay və Google Pay üçün Token Widget URL əldə edir
     * POST https://epoint.az/api/1/token/widget
     */
    public EpointWidgetResponse createTokenWidget(EpointPaymentRequest request) {
        // ✅ DÜZƏLİŞ: Burada mütləq getPublicKey() olmalıdır!
        request.setPublicKey(properties.getPublicKey());
        request.setSuccessRedirectUrl(properties.getSuccessRedirectUrl());
        request.setErrorRedirectUrl(properties.getErrorRedirectUrl());

        try {
            String jsonPayload = objectMapper.writeValueAsString(request);
            log.info("ePoint Token Widget JSON: {}", jsonPayload);

            String data = Base64.getEncoder().encodeToString(jsonPayload.getBytes(StandardCharsets.UTF_8));
            String signature = generateSignature(data);

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("data", data);
            formData.add("signature", signature);

            return restClient.post()
                    .uri("/token/widget")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formData)
                    .retrieve()
                    .body(EpointWidgetResponse.class);

        } catch (JsonProcessingException e) {
            log.error("ePoint Token Widget JSON serialization error: ", e);
            throw new PaymentFailedException("Token Widget sorğusu hazırlana bilmədi");
        } catch (RestClientResponseException e) {
            log.error("ePoint Token Widget API error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new PaymentFailedException("ePoint Token Widget xətası: " + e.getStatusCode());
        }
    }

    /**
     * American Express (AMEX) Kartları üçün Ödəniş
     * POST https://epoint.az/api/1/amex-request
     */
    public EpointPaymentResponse createAmexPayment(EpointPaymentRequest request) {
        request.setPublicKey(properties.getPublicKey());
        request.setSuccessRedirectUrl(properties.getSuccessRedirectUrl());
        request.setErrorRedirectUrl(properties.getErrorRedirectUrl());

        try {
            String jsonPayload = objectMapper.writeValueAsString(request);
            log.info("ePoint AMEX Request JSON: {}", jsonPayload);

            String data = Base64.getEncoder().encodeToString(jsonPayload.getBytes(StandardCharsets.UTF_8));
            String signature = generateSignature(data);

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("data", data);
            formData.add("signature", signature);

            return restClient.post()
                    .uri("/amex-request") // 🔹 ePoint rəsmi AMEX endpoint-i
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formData)
                    .retrieve()
                    .body(EpointPaymentResponse.class);

        } catch (JsonProcessingException e) {
            log.error("ePoint AMEX JSON serialization error: ", e);
            throw new PaymentFailedException("AMEX sorğusu hazırlana bilmədi");
        } catch (RestClientResponseException e) {
            log.error("ePoint AMEX API error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new PaymentFailedException("ePoint AMEX API xətası: " + e.getStatusCode());
        }
    }

}