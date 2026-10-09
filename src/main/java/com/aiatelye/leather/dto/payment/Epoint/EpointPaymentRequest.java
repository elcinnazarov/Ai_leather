package com.aiatelye.leather.dto.payment.Epoint;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EpointPaymentRequest {

    @JsonProperty("public_key")
    private String publicKey;

    @JsonProperty("amount")
    private BigDecimal amount;

    @JsonProperty("currency")
    private String currency; // "USD", "EUR", "AZN"

    @JsonProperty("language")
    private String language; // "az", "en", "ru"

    @JsonProperty("order_id")
    private String orderId;

    @JsonProperty("description")
    private String description;

    @JsonProperty("success_redirect_url")
    private String successRedirectUrl;

    @JsonProperty("error_redirect_url")
    private String errorRedirectUrl;
}
