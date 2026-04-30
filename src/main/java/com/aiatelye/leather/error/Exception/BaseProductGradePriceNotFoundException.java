package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class BaseProductGradePriceNotFoundException extends RuntimeException {
    private final Object[] args;

    public BaseProductGradePriceNotFoundException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

}