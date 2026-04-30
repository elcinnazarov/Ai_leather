package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class InvalidStateTransitionException extends RuntimeException {
    private final Object[] args;

    public InvalidStateTransitionException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

}