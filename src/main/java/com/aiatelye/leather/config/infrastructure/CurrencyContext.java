package com.aiatelye.leather.config.infrastructure;

import com.aiatelye.leather.enums.Enums;

public class CurrencyContext {

    private static final ThreadLocal<Enums.Currency> currentCurrency = new ThreadLocal<>();

    public static void setCurrency(Enums.Currency currency) {
        currentCurrency.set(currency);
    }

    public static Enums.Currency getCurrency() {
        Enums.Currency currency = currentCurrency.get();
        return currency != null ? currency : Enums.Currency.AZN; // Default AZN
    }

    public static void clear() {
        currentCurrency.remove();
    }
}