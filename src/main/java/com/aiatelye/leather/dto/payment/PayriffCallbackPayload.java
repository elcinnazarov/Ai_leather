package com.aiatelye.leather.dto.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

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

    private String orderId;
    private String status;          // APPROVED, DECLINED, CANCELED, EXPIRED, REVERSE, PARTIAL_REFUND ...
    private String responseCode;
    private String responseDescription;
    private Double amount;
    private String currency;
    private String cardUuid;
    private String pan;
    private String rrn;
    private Map<String, String> metadata;
}
