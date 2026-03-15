package com.aiatelye.leather.service.pricing;

import com.aiatelye.leather.dao.CalculatedPrice;
import com.aiatelye.leather.dao.PricingRule;
import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.repository.PricingRuleRepository;
import com.aiatelye.leather.repository.ProductGradePriceRepository;
import com.aiatelye.leather.cache.PriceCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.EnumMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalculatePriceService {
    private final PriceCacheRepository priceCacheRepository;
    private final ProductGradePriceRepository productGradePriceRepository;
    private final PricingRuleRepository pricingRuleRepository;


    public BigDecimal calculatePrice(BigDecimal baseAzn, PricingRule rule) {
        // 1. Vurma
        BigDecimal afterMultiplier = baseAzn.multiply(rule.getMultiplier());

        // 2. Sabit əlavə
        BigDecimal afterFixed = afterMultiplier.add(rule.getFixedAmount());

        // 3. Yuvarlaqlaşdırma
        if (Boolean.TRUE.equals(rule.getRoundTo99())) {
            // 257.00 → 256.99
            BigDecimal floor = afterFixed.setScale(0, RoundingMode.FLOOR);
            return floor.subtract(BigDecimal.ONE).add(new BigDecimal("0.99"));
        }

        return afterFixed.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Wrapper - rule null ola bilər
     */
    public BigDecimal calculateAutoPrice(BigDecimal baseAzn, PricingRule rule) {
        if (rule == null) {
            return baseAzn; // Rule yoxdursa base qiymət
        }
        return calculatePrice(baseAzn, rule);
    }

    /**
     * PUBLIC API - Bir valyuta üçün (cache first)
     */
    public CalculatedPrice getCalculatedPrice(Long productId, Long gradeId, Enums.Currency currency) {
        return priceCacheRepository.getPrice(productId, gradeId, currency.name())
                .map(amount -> buildCacheResult(amount, currency))
                .orElseGet(() -> calculateAndCache(productId, gradeId, currency));
    }

    /**
     * YENİ - Bütün valyutalar üçün (batch)
     */
    public Map<Enums.Currency, CalculatedPrice> getAllCalculatedPrices(Long productId, Long gradeId) {
        // 1. Cache-dən yoxla
        Map<Enums.Currency, BigDecimal> cached = priceCacheRepository.getAllPrices(productId, gradeId);

        if (cached.size() == Enums.Currency.values().length) {
            // Hamısı cache-dədir
            Map<Enums.Currency, CalculatedPrice> result = new EnumMap<>(Enums.Currency.class);
            cached.forEach((curr, amount) ->
                    result.put(curr, buildCacheResult(amount, curr))
            );
            return result;
        }

        // 2. Hesabla və cache-lə
        return calculateAllAndCache(productId, gradeId);
    }

    /**
     * PRIVATE - Hesabla + 3 valutanı birdən cache-lə
     */
    private CalculatedPrice calculateAndCache(Long productId, Long gradeId, Enums.Currency requestedCurrency) {

        // Bütün valyutaları hesabla (birdən çox nəticə alırıq)
        Map<Enums.Currency, CalculatedPrice> allCalculated = calculateAllAndCache(productId, gradeId);

        // İstəniləni qaytar
        return allCalculated.get(requestedCurrency);
    }

    /**
     * PRIVATE - Əsas optimizasiya burada
     */
    private Map<Enums.Currency, CalculatedPrice> calculateAllAndCache(Long productId, Long gradeId) {

        //  1. DB-DƏN BİR DƏFƏ ÇƏK
        ProductGradePrice entity = productGradePriceRepository
                .findByProductModelIdAndGradeId(productId, gradeId)
                .orElseThrow(() -> new RuntimeException(
                        "Price not found for Product: " + productId + " Grade: " + gradeId));

        //  2. RULE-LARI BİR DƏFƏ AL
        Map<Enums.Currency, PricingRule> activeRules = pricingRuleRepository.findAllActive()
                .stream()
                .collect(Collectors.toMap(
                        PricingRule::getTargetCurrency,
                        r -> r
                ));

        // 3. 3 VALUTA BİRLİKDƏ HESABLA
        Map<Enums.Currency, CalculatedPrice> calculated = calculateAllCurrencies(entity, activeRules);

        //  4. 3-NÜ BİRDƏN CACHE YAZ (yalnız AUTO olanları)
        Map<Enums.Currency, BigDecimal> toCache = new EnumMap<>(Enums.Currency.class);
        calculated.forEach((curr, value) -> {
            if ("AUTO".equals(value.getSource()) || "BASE".equals(value.getSource())) {
                toCache.put(curr, value.getAmount());
            }
        });
        priceCacheRepository.saveAllPrices(productId, gradeId, toCache);

        return calculated;
    }

    /**
     * PRIVATE - 3 valutanı birdən hesabla
     */
    private Map<Enums.Currency, CalculatedPrice> calculateAllCurrencies(
            ProductGradePrice entity,
            Map<Enums.Currency, PricingRule> rules) {

        BigDecimal baseAzn = entity.getPrice();
        Map<Enums.Currency, CalculatedPrice> result = new EnumMap<>(Enums.Currency.class);

        for (Enums.Currency currency : Enums.Currency.values()) {

            // AZN
            if (currency == Enums.Currency.AZN) {
                result.put(currency, buildPrice(baseAzn, currency, "BASE", null));
                continue;
            }

            // Manual
            BigDecimal manual = getManualPrice(entity, currency);
            if (manual != null) {
                result.put(currency, buildPrice(manual, currency, "MANUAL", null));
                continue;
            }

            // Auto
            PricingRule rule = rules.get(currency);
            BigDecimal auto = calculateAutoPrice(baseAzn, rule);
            result.put(currency, buildPrice(auto, currency, "AUTO", rule));
        }

        return result;
    }

    private CalculatedPrice buildCacheResult(BigDecimal amount, Enums.Currency currency) {
        return CalculatedPrice.builder()
                .amount(amount)
                .currency(currency)
                .source("CACHE")
                .build();
    }

    private CalculatedPrice buildPrice(BigDecimal amount, Enums.Currency currency,
                                       String source, PricingRule rule) {
        return CalculatedPrice.builder()
                .amount(amount)
                .currency(currency)
                .source(source)
                .ruleMultiplier(rule != null ? rule.getMultiplier() : null)
                .ruleFixed(rule != null ? rule.getFixedAmount() : null)
                .build();
    }

    private BigDecimal getManualPrice(ProductGradePrice entity, Enums.Currency currency) {
        return switch (currency) {
            case USD -> entity.getManualUsd();
            case EUR -> entity.getManualEur();
            default -> null;
        };
    }




    public void invalidateCache(Long productId, Long gradeId) {
        priceCacheRepository.invalidateProductPrices(productId, gradeId);
    }


}