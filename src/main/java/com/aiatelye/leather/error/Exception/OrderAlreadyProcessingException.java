package com.aiatelye.leather.error.Exception;

public class OrderAlreadyProcessingException extends RuntimeException {
    public OrderAlreadyProcessingException(String message) {
        super(message);
    }
}
