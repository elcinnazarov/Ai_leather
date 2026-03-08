package com.aiatelye.leather.messaging.rabbitMQ;

import com.aiatelye.leather.config.RabbitConfig;
import com.aiatelye.leather.messaging.rabbitMQ.event.DesignGenerationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DesingPublicsher {

    private final RabbitTemplate rabbitTemplate;

    public void send(DesignGenerationEvent event) {
        log.info("Sending design event: designId={}, hash={}, status={}",
                event.getDesignId(), event.getCacheKey(), event.getStatus());

        rabbitTemplate.convertAndSend(
                RabbitConfig.DESIGN_EXCHANGE,
                RabbitConfig.DESIGN_ROUTING_KEY,
                event);

        log.info("Design event sent to n8n queue");
    }
}
