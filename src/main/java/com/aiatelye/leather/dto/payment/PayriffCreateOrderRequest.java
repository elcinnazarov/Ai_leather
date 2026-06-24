package com.aiatelye.leather.dto.payment;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

/**
 * PayRiff Gateway API V3 - "Create Order" sorğu body-si.
 * POST https://api.payriff.com/api/v3/orders
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PayriffCreateOrderRequest {

    private BigDecimal amount;
    private String language;        // "AZ" | "EN" | "RU"
    private String currency;        // "AZN" | "USD" | "EUR"
    private String description;
    private String callbackUrl;
    private Boolean cardSave;
    private String operation;       // "PURCHASE"
    private Map<String, String> metadata;
}
