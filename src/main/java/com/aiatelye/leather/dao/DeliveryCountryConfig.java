package com.aiatelye.leather.dao;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
@Entity
@Table(name = "delivery_country_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryCountryConfig extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "country_code", unique = true, nullable = false, length = 2)
    private String countryCode;

    @Column(name = "country_name", nullable = false)
    private String countryName;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "disabled_at")
    private LocalDateTime disabledAt;

    @Column(name = "disabled_by")
    private String disabledBy;
}
