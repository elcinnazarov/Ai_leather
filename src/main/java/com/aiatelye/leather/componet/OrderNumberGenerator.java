package com.aiatelye.leather.componet;

import jakarta.annotation.PostConstruct;
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

    // YENİ ƏLAVƏ: Tətbiq işə düşən kimi PostgreSQL-də bu ardıcıllığı avtomatik yaradır (əgər yoxdursa)
    @PostConstruct
    public void init() {
        try {
            // Sənin məntiqində mod 10000 (% 10000) olduğu üçün sequence-in 1-dən başlamağı kifayətdir
            String sql = "CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1 INCREMENT BY 1;";
            jdbcTemplate.execute(sql);
            log.info("Database sequence 'order_number_seq' checked/created successfully.");
        } catch (Exception e) {
            log.error("Error creating database sequence: ", e);
        }
    }

    // SƏNİN Orijinal Məntiqin (Toxunulmayıb)
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