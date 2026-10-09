package com.aiatelye.leather.dto.payment.Epoint;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class EpointPaymentResponse {

    private String status; // "success" və ya "error"

    @JsonProperty("redirect_url")
    private String redirectUrl; // Bank səhifəsi linki

    private String transaction; // ePoint transaction ID

    private String message;

    @JsonProperty("trace_id")
    private String traceId;

    public boolean isSuccess() {
        return "success".equalsIgnoreCase(this.status) && this.redirectUrl != null;
    }
}