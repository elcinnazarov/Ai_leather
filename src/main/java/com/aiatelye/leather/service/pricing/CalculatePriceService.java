package com.aiatelye.leather.service.pricing;

import com.aiatelye.leather.dao.CalculatedPrice;
import com.aiatelye.leather.dao.PricingRule;
import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.repository.PricingRuleRepository;
import com.aiatelye.leather.repository.ProductGradePriceRepository;
import com.aiatelye.leather.repository.cache.PriceCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
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


    public CalculatedPrice getCalculatedPrice(Long productId, Long gradeId, Enums.Currency currency) {

        // 2. Digər valyutalar üçün Optional zənciri:
        return priceCacheRepository.getPrice(productId, gradeId, currency.name())
                .map(amount -> {
                    // Keşdə tapılsa dərhal "CACHE" source ilə qaytar
                    return CalculatedPrice.builder()
                            .amount(amount)
                            .currency(currency)
                            .source("CACHE")
                            .build();
                })
                // 3. Keşdə yoxdursa (.orElseGet), hesabla və lazımdırsa keşə yaz
                .orElseGet(() -> {
                    CalculatedPrice result = doCalculation(productId, gradeId, currency);

                    // Yalnız AUTO qiymətləri keşə yazırıq (Manual qiymətlər onsuz da DB-dən sürətli gəlir)
                    if ("AUTO".equals(result.getSource())) {
                        priceCacheRepository.savaPrice(productId, gradeId, currency.name(), result.getAmount());
                    }

                    return result;
                });
    }

    private CalculatedPrice doCalculation(Long productId, Long gradeId, Enums.Currency currency) {
        ProductGradePrice productGradePrice = productGradePriceRepository.findByProductModelIdAndGradeId(productId, gradeId)
                .orElseThrow(() -> new RuntimeException("Price not found for Product: " + productId + " Grade: " + gradeId));

        BigDecimal baseAzn = productGradePrice.getPrice();

        // AZN məntiqi
        if (currency == Enums.Currency.AZN) {
            return CalculatedPrice.builder()
                    .amount(baseAzn)
                    .currency(currency)
                    .source("BASE")
                    .build();
        }

        // Manual qiymət məntiqi
        BigDecimal manual = getManualPrice(productGradePrice, currency);
        if (manual != null) {
            return CalculatedPrice.builder()
                    .amount(manual)
                    .currency(currency)
                    .source("MANUAL")
                    .build();
        }

        // Avtomatik hesablama məntiqi
        PricingRule rule = pricingRuleRepository.findByTargetCurrencyAndIsActiveTrue(currency).orElse(null);
        BigDecimal autoPrice = calculateAutoPrice(baseAzn, rule);

        return CalculatedPrice.builder()
                .amount(autoPrice)
                .currency(currency)
                .source("AUTO")
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