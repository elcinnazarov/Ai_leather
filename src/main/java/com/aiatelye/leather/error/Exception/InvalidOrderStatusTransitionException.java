package com.aiatelye.leather.error.Exception;


import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.enums.Enums.OrderStatus;

public class InvalidOrderStatusTransitionException extends RuntimeException {
    public InvalidOrderStatusTransitionException(String message ) {
        super(message);
    }
}
