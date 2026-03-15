package com.aiatelye.leather.cache;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;


@Repository
@Slf4j
@RequiredArgsConstructor
public class PriceCacheRepository {

    @Qualifier("priceRedisCacheTemplate")
    private final RedisTemplate<String, String> redisTemplatePrice_PriceCache;

    @Value("${cache.redis.price.ttl}")
    private Long  ttlMinutes;

    private static final String PRICE_PREFIX = "price:product:";

    public void savaPrice(Long productId, Long gradeId, String currency, BigDecimal price) {

        String key = buildKey(productId, gradeId, currency);
        redisTemplatePrice_PriceCache.opsForValue().set(
                key,
                price.toString(),
                ttlMinutes,
                TimeUnit.HOURS
        );
        log.info("Price cached: {}", key);
    }


    public Optional<BigDecimal> getPrice(Long productId, Long gradeId, String currency) {
        String key = buildKey(productId, gradeId, currency);

        String cached = redisTemplatePrice_PriceCache.opsForValue().get(key);

        return Optional.ofNullable(cached)
                .map(val -> {
                    log.info("Price cache hit: {}", key);
                    return new BigDecimal(val);
                });

    }

    public void invalidateProductPrices(Long productId, Long gradeId) {
        for (String currency : new String[]{"USD", "EUR", "AZN"}) {
            deletePrice(productId, gradeId, currency);
        }
    }

    public void invalidateManuelPrices(Long productId, Long gradeId) {
        for (String currency : new String[]{"USD", "EUR"}) {
            deletePrice(productId, gradeId, currency);
        }
    }

    public void deletePrice(Long productId, Long gradeId, String currency) {
        String key = buildKey(productId, gradeId, currency);
        redisTemplatePrice_PriceCache.delete(key);
        log.info("Price cache deleted: {}", key);
    }


    private String buildKey(Long productId, Long gradeId, String currency) {
        return PRICE_PREFIX + productId + ":grade:" + gradeId + ":" + currency;
    }


    // Birdən çox qiymət yazmaq üçün
    public void saveAllPrices(Long productId, Long gradeId,
                              Map<Enums.Currency, BigDecimal> prices) {
        prices.forEach((currency, amount) ->
                savaPrice(productId, gradeId, currency.name(), amount)
        );
    }

    // Birdən çox qiymət oxumaq üçün
    public Map<Enums.Currency, BigDecimal> getAllPrices(Long productId, Long gradeId) {
        Map<Enums.Currency, BigDecimal> result = new EnumMap<>(Enums.Currency.class);

        for (Enums.Currency currency : Enums.Currency.values()) {
            getPrice(productId, gradeId, currency.name())
                    .ifPresent(amount -> result.put(currency, amount));
        }

        return result;
    }
}
