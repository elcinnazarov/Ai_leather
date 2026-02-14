package com.aiatelye.leather.config.infrastructure;

import com.aiatelye.leather.enums.Enums;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
    @Component
    public class CurrencyInterceptor implements HandlerInterceptor {

        @Override
        public boolean preHandle(HttpServletRequest request, @NotNull HttpServletResponse response,
                                 @NotNull Object handler) {
        // Header-dən oxu: X-Currency: USD
        String currencyHeader = request.getHeader("X-Currency");

        if (currencyHeader != null && !currencyHeader.isBlank()) {
            try {
                Enums.Currency currency = Enums.Currency.valueOf(currencyHeader.toUpperCase());
                CurrencyContext.setCurrency(currency);
            } catch (IllegalArgumentException e) {
                // Default AZN
                CurrencyContext.setCurrency(Enums.Currency.AZN);
            }
        } else {
            CurrencyContext.setCurrency(Enums.Currency.AZN);
        }

        return true;
    }

    @Override
    public void afterCompletion(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response,
                                @NotNull Object handler, Exception ex) {
        CurrencyContext.clear(); // Təmizlə (memory leak olmasın)
    }
}
