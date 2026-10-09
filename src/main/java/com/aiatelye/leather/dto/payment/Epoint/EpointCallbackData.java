package com.aiatelye.leather.dto.payment.Epoint;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EpointCallbackData {

    private String status; // "success", "failed", "error"
    private String transaction;

    @JsonProperty("order_id")
    private String orderId;

    private BigDecimal amount;
    private String currency;

    @JsonProperty("bank_transaction")
    private String bankTransaction;

    private String rrn;
    private String message;
}