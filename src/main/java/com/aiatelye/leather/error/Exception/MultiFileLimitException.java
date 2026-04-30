package com.aiatelye.leather.error.Exception;

public class MultiFileLimitException extends RuntimeException {
    private final Object[] args;

    public MultiFileLimitException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

    public Object[] getArgs() {
        return args;
    }
}