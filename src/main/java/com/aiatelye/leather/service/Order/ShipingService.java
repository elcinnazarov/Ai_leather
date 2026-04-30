package com.aiatelye.leather.service.Order;

import com.aiatelye.leather.common.CountryCurrencyMapper;
import com.aiatelye.leather.dao.ShippingLocation;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.error.Exception.BadRequestException;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.repository.ShippingLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShipingService {

    private final ShippingLocationRepository locationRepository;

    public BigDecimal calculate(Enums.Country country, String city, Enums.Currency currency, BigDecimal subTotal) {
// 🔒 Mapper vasitəsilə Tələb Olunan Valyutanı tap (DRY Prinsipi)
        Enums.Currency expected = CountryCurrencyMapper.getCurrencyForCountry(country);

        if (currency != expected) {
            log.error("Arbitraj Cəhdi! Çatdırılma ölkəsi: {}, Göndərilən Valyuta: {}", country, currency);
            throw new BadRequestException(
                    "For " + country + " shipping, currency must be " + expected
            );
        }
        // 1. Spesifik -> 2. Ölkə Standartı -> 3. Qlobal Standart (Zəncirvari axtarış)
        ShippingLocation location = locationRepository
                .findByCountryAndCityNameAndCurrencyAndIsActiveTrue(country, city, currency) // 1. City Level
                .or(() -> locationRepository.findByCountryAndCityNameIsNullAndCurrencyAndIsActiveTrue(country, currency)) // 2. Country Level
                .or(() -> locationRepository.findByCountryAndCityNameIsNullAndCurrencyAndIsActiveTrue(Enums.Country.INTERNATIONAL_OTHER, currency)) // 3. Global Level
                .orElseThrow(() -> new NotFoundException("Shipping rate not found for " + country + " in " + currency));

        return applyThreshold(location, subTotal);
    }

    private BigDecimal applyThreshold(ShippingLocation location, BigDecimal subTotal) {
        // Əgər pulsuz hədd təyin olunubsa və səbət o həddi keçibsə -> 0 AZN/USD
        if (location.getFreeThreshold() != null && subTotal.compareTo(location.getFreeThreshold()) >= 0) {
            log.info("Free shipping applied for location: {}", location.getId());
            return BigDecimal.ZERO;
        }
        // Yoxsa standart kuryer pulu
        return location.getFee();
    }
}
