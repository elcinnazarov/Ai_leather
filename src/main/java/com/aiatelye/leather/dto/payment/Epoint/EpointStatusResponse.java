package com.aiatelye.leather.dto.payment.Epoint;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class EpointStatusResponse {

    private String status; // "success", "failed", "new", "returned", "error"
    private String code;
    private String message;
    private String transaction;

    @JsonProperty("bank_transaction")
    private String bankTransaction;

    @JsonProperty("bank_response")
    private String bankResponse;

    @JsonProperty("order_id")
    private String orderId;

    private BigDecimal amount;
    private String currency;
    private String rrn;

    public boolean isApproved() {
        return "success".equalsIgnoreCase(this.status);
    }
}