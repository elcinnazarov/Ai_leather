package com.aiatelye.leather.controller.AiDesinger;

import com.aiatelye.leather.dto.AiDesinger.AICallbackRequest;
import com.aiatelye.leather.service.design.AICallbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class AICallbackController {

    private final AICallbackService callbackService;
    private final StringRedisTemplate redisTemplate;

    @Value("${ai.callback.secret}")
    private String callbackSecret;

    @PostMapping("/ai-callback")
    public ResponseEntity<Void> handleCallback(
            @Valid @RequestBody AICallbackRequest request,
            @RequestHeader("X-Internal-Secret") String secret) {

        // 1. Security check
        if (!callbackSecret.equals(secret)) {
            log.warn(" Invalid callback secret");
            return ResponseEntity.status(403).build();
        }

        // 2. IDEMPOTENCY CHECK (Redis)
        String idempotencyKey = "callback:processed:" + request.getDesignId();

        Boolean isNew = redisTemplate.opsForValue()
                .setIfAbsent(idempotencyKey, "processing", 5, TimeUnit.MINUTES);

        if (Boolean.FALSE.equals(isNew)) {
            log.warn(" Duplicate callback blocked: designId={}", request.getDesignId());
            return ResponseEntity.ok().build();  // 200 OK, amma işləmədik
        }

        try {
            // 3. Process
            callbackService.processCallback(request);

            // 4. Mark completed
            redisTemplate.opsForValue().set(idempotencyKey, "completed", 24, TimeUnit.HOURS);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            // Xəta olsa, key-i sil ki, təkrar cəhd edə bilsin
            redisTemplate.delete(idempotencyKey);
            throw e;
        }
    }
}
