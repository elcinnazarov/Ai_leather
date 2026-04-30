package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class ImageNotFoundException extends RuntimeException {
    private final Object[] args;

    public ImageNotFoundException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

}
