package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class ImageFileRequired extends RuntimeException {
    private final Object[] args;

    public ImageFileRequired(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

}