package com.aiatelye.leather.validators;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = RequestUpdateMultiplier.class)
public @interface MultiplierMinimum1 {
    String message() default "Multiplier must be at least 1.0 ";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
