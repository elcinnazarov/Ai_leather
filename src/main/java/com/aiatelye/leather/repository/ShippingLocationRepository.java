package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.ShippingLocation;
import com.aiatelye.leather.enums.Enums;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShippingLocationRepository extends JpaRepository<ShippingLocation, Long> {


    /**
     * 1. Spesifik Şəhər Səviyyəsi:
     * Ölkə, Şəhər adı və Valyuta üçlüyünə görə aktiv qiyməti axtarır.
     */
    Optional<ShippingLocation> findByCountryAndCityNameAndCurrencyAndIsActiveTrue(
            Enums.Country country, String cityName, Enums.Currency currency);

    /**
     * 2. Ölkə və ya Qlobal Səviyyə (City = null):
     * Şəhər adı olmayan (null), sadəcə ölkə və valyuta uyğunluğu olan aktiv qiyməti axtarır.
     * Bu metod həm "Azerbaijan + null", həm də "INTERNATIONAL_OTHER + null" üçün istifadə olunur.
     */
    Optional<ShippingLocation> findByCountryAndCityNameIsNullAndCurrencyAndIsActiveTrue(
            Enums.Country country, Enums.Currency currency);


    Optional<ShippingLocation> findByCountryAndCityName(Enums.Country country, String cityName);
}
