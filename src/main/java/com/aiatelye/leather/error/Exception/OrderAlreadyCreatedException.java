package com.aiatelye.leather.error.Exception;

public class OrderAlreadyCreatedException extends RuntimeException {
    public OrderAlreadyCreatedException(String message) {
        super(message);
    }
}
