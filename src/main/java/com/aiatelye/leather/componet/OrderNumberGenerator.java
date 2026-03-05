package com.aiatelye.leather.componet;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;


@Component
@RequiredArgsConstructor
@Slf4j
public class OrderNumberGenerator {

    private final JdbcTemplate jdbcTemplate;

    public String generate() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // PostgreSQL sequence istifadə et
        Long sequence = jdbcTemplate.queryForObject(
                "SELECT nextval('order_number_seq')",
                Long.class
        );

        return String.format("ORD-%s-%04d", date, sequence % 10000);
    }
}
