package com.aiatelye.leather.error.Exception;

public class UserLimitNotFoundException extends RuntimeException {
    public UserLimitNotFoundException(String message) {
        super(message);
    }
}
