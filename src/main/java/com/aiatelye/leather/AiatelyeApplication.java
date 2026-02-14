package com.aiatelye.leather;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class AiatelyeApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiatelyeApplication.class, args);
    }

}
