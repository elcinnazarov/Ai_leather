package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class MinioDeleteException extends RuntimeException {
    private final Object[] args;

    public MinioDeleteException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

}