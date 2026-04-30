package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class PrimaryImageException extends RuntimeException {
    private final Object[] args;

    public PrimaryImageException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

}