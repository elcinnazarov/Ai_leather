package com.aiatelye.leather.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
@Configuration
public class RabbitConfig {


    // Java → n8n (AI Generation) - Yalnız bir istiqamət
    public static final String DESIGN_EXCHANGE = "design.exchange";
    public static final String DESIGN_QUEUE = "design.queue";
    public static final String DESIGN_ROUTING_KEY = "design.routing.key";
    public static final String DESIGN_DLQ = "design.dlq";
    public static final String DESIGN_DLQ_ROUTING_KEY = "design.dlq.routing.key";

    @Bean
    DirectExchange designExchange() {
        return new DirectExchange(DESIGN_EXCHANGE);
    }

    @Bean
    DirectExchange designDLQExchange() {
        return new DirectExchange(DESIGN_EXCHANGE + ".dlx");
    }

    @Bean
    Queue designQueue() {
        return QueueBuilder.durable(DESIGN_QUEUE)
                .withArgument("x-dead-letter-exchange", DESIGN_EXCHANGE + ".dlx")
                .withArgument("x-dead-letter-routing-key", DESIGN_DLQ_ROUTING_KEY)
                .withArgument("x-message-ttl", 300000) // 5 dəqiqə
                .build();
    }

    @Bean
    Queue designDLQ() {
        return new Queue(DESIGN_DLQ, true);
    }

    @Bean
    Binding designBinding() {
        return BindingBuilder
                .bind(designQueue())
                .to(designExchange())
                .with(DESIGN_ROUTING_KEY);
    }

    @Bean
    Binding designDLQBinding() {
        return BindingBuilder
                .bind(designDLQ())
                .to(designDLQExchange())
                .with(DESIGN_DLQ_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter converter) {

        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }

}
