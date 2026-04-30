package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class BaseCurrencyUpdateException extends RuntimeException {
    private final Object[] args;

    public BaseCurrencyUpdateException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

}