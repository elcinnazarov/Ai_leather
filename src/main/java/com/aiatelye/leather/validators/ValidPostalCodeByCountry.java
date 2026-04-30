package com.aiatelye.leather.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE) // Klas səviyyəsində işləyir
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PostalCodeValidator.class)
public @interface ValidPostalCodeByCountry {

    String message() default "Azerbaijan üçün poçt indeksi boş qalmalıdır, digər ölkələr üçün mütləqdir.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
