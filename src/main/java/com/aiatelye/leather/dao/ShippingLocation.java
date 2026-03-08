package com.aiatelye.leather.dao;

import com.aiatelye.leather.enums.Enums;
import jakarta.persistence.*;
import lombok.*;


import java.math.BigDecimal;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "shipping_locations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"country", "city_name","currency"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingLocation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "country", nullable = false, length = 30)
    private Enums.Country country;

    @Column(name = "city_name", length = 50)
    private String cityName;  // null = bütün ölkə üçün standart

    @Column(name = "fee", precision = 19, scale = 4, nullable = false)
    private BigDecimal fee;  // Standart və ya xüsusi qiymət

    @Enumerated(EnumType.STRING)
    @Column(name = "currency", nullable = false)
    private Enums.Currency currency;

    @Column(name = "free_threshold", precision = 19, scale = 4)
    private BigDecimal freeThreshold;

    @Column(name = "requires_postal_code", nullable = false)
    @Builder.Default
    private Boolean requiresPostalCode = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
