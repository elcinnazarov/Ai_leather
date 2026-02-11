package com.aiatelye.leather.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = RequestCreatPricingValidators.class)
public @interface NotBaseCurrencyAZN {
    String message() default " can Not choose base currency (AZN) ";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}
