package com.aiatelye.leather.validators;

import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.dto.order.CreateOrderRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PostalCodeValidator implements ConstraintValidator<ValidPostalCodeByCountry, CreateOrderRequest> {

    @Override
    public boolean isValid(CreateOrderRequest request, ConstraintValidatorContext context) {
        if (request == null || request.getCountry() == null) {
            return true; // @NotNull(country) bunu onsuz da tutacaq
        }

        boolean isAzerbaijan = request.getCountry() == Enums.Country.AZERBAIJAN;
        String postalCode = request.getPostalCode();
        boolean isPostalCodeEmpty = (postalCode == null || postalCode.trim().isEmpty());

        if (isAzerbaijan) {
            // Azərbaycan seçilibsə, postalCode MÜTLƏQ boş olmalıdır
            return isPostalCodeEmpty;
        } else {
            // Digər ölkələr üçün postalCode MÜTLƏQ dolu olmalıdır
            return !isPostalCodeEmpty;
        }
    }

}