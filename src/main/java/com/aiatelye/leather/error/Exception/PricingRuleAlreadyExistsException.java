package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class PricingRuleAlreadyExistsException extends RuntimeException {
    private final Object[] args;

    public PricingRuleAlreadyExistsException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

}