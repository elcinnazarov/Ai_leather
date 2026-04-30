package com.aiatelye.leather.common;

import com.aiatelye.leather.dao.enums.Enums;

public class CountryCurrencyMapper {
    private CountryCurrencyMapper() {} // Obyekt yaradılmasının qarşısını alırıq

    // 1. Sifariş və Çatdırılma (Enum) üçün
    public static Enums.Currency getCurrencyForCountry(Enums.Country country) {
        if (country == null) return Enums.Currency.USD;

        return switch (country) {
            case AZERBAIJAN -> Enums.Currency.AZN;

            // Avropa ölkələri üçün EUR (UK-ni qlobal bazar kimi USD-yə çıxarırıq)
            case GERMANY, FRANCE, ITALY, SWITZERLAND -> Enums.Currency.EUR;

            // Qlobal lüks bazarlar və digər beynəlxalq zonalar üçün USD
            case USA, CANADA, UNITED_KINGDOM, JAPAN, AUSTRALIA,
                 UAE, SAUDI_ARABIA, INTERNATIONAL_OTHER -> Enums.Currency.USD;
        };
    }

    // 2. İnterceptor və GeoIP (String ISO Code) üçün
    public static Enums.Currency getCurrencyForIsoCode(String isoCode) {
        if (isoCode == null || isoCode.isEmpty()) return Enums.Currency.USD;

        return switch (isoCode.toUpperCase()) {
            case "AZ" -> Enums.Currency.AZN;

            // Avropa İttifaqı və İsveçrə
            case "DE", "FR", "IT", "ES", "NL", "BE", "AT", "CH", "PT", "GR" -> Enums.Currency.EUR;

            // ABŞ, UK, Kanada, Yaponiya, Avstraliya, BƏƏ, Səudiyyə Ərəbistanı və digərləri
            case "US", "GB", "CA", "JP", "AU", "AE", "SA", "QA", "KW" -> Enums.Currency.USD;

            default -> Enums.Currency.USD;
        };
    }
}
