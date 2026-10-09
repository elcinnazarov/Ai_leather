package com.aiatelye.leather.dto.payment.Epoint;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EpointStatusRequest {
    @JsonProperty("public_key")
    private String publicKey;

    @JsonProperty("transaction")
    private String transaction;
}