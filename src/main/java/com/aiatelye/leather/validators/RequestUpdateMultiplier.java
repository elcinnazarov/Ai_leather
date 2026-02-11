package com.aiatelye.leather.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.math.BigDecimal;

    public class RequestUpdateMultiplier implements ConstraintValidator<NotBaseCurrencyAZN, BigDecimal> {

        @Override
        public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {

            if (value.compareTo(BigDecimal.ONE) < 0 && value.compareTo(BigDecimal.ZERO) > 0) {
                return false;
            }

            return true;
        }
    }
