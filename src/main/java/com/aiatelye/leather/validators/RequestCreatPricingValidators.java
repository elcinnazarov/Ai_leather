package com.aiatelye.leather.validators;

import com.aiatelye.leather.dao.enums.Enums;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;



public class RequestCreatPricingValidators implements ConstraintValidator<NotBaseCurrencyAZN, Enums.Currency> {
    @Override
    public boolean isValid(Enums.Currency value, ConstraintValidatorContext context) {

        if(value.equals(Enums.Currency.AZN)){
            return false;
        }

        return true;
    }
}
