package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class AddProductImagesException extends RuntimeException {
    private final Object[] args;

    public AddProductImagesException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

}
