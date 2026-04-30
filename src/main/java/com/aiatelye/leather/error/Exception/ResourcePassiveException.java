package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class ResourcePassiveException extends RuntimeException {
    private final Object[] args;

    public ResourcePassiveException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

}