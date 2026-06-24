package com.aiatelye.leather.dto.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

/**
 * PayRiff bütün cavablarını bu zərf (envelope) içində qaytarır:
 * { "code": "...", "message": "...", "internalMessage": "...", "payload": {...} }
 *
 * @param <T> payload tipi (məs: PayriffOrderPayload)
 */
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class PayriffResponse<T> {

    private String code;
    private String message;
    private String internalMessage;
    private String route;
    private T payload;

    public boolean isSuccess() {
        return "00000".equals(code);
    }
}
