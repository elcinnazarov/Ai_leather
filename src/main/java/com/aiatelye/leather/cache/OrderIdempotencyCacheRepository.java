package com.aiatelye.leather.cache;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeUnit;

@Repository
@Slf4j
@RequiredArgsConstructor
public class OrderIdempotencyCacheRepository {

    @Qualifier("OrderIdempotencyCache")
    private final RedisTemplate<String, String> redisTemplate_OrderIdempotencyCached;

    private static final String KEY_PREFIX = "order:processing:";

    @Value("${cache.redis.orderIdempotency.ttl}")
    private  long TTL_SECONDS ; // 30 saniyə


    /**
     * İşlənməkdə olduğunu qeyd et
     */
    public boolean tryLock(String idempotencyKey, String userId) {
        String key = KEY_PREFIX + userId + ":" + idempotencyKey;
        Boolean success = redisTemplate_OrderIdempotencyCached.opsForValue()
                .setIfAbsent(key, "processing", TTL_SECONDS, TimeUnit.SECONDS);
        return Boolean.TRUE.equals(success);
    }

    /**
     * İşləndiyini qeyd et (uğurlu olduqda)
     */
    public void markCompleted(String idempotencyKey, String userId, String orderNumber) {
        String key = KEY_PREFIX + userId + ":" + idempotencyKey;
        redisTemplate_OrderIdempotencyCached.opsForValue().set(key, orderNumber, TTL_SECONDS, TimeUnit.SECONDS);
    }

    /**
     * Status yoxla
     */
    public String getStatus(String idempotencyKey, String userId) {
        String key = KEY_PREFIX + userId + ":" + idempotencyKey;
        return redisTemplate_OrderIdempotencyCached.opsForValue().get(key);
    }

    /**
     * Kilidi aç (xəta olduqda)
     */
    public void unlock(String idempotencyKey, String userId) {
        String key = KEY_PREFIX + userId + ":" + idempotencyKey;
        redisTemplate_OrderIdempotencyCached.delete(key);
    }


}
