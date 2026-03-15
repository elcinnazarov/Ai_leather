package com.aiatelye.leather.error.Exception;


public class InvalidOrderStatusTransitionException extends RuntimeException {
    public InvalidOrderStatusTransitionException(String message ) {
        super(message);
    }
}
