package com.aiatelye.leather.dao;


import com.aiatelye.leather.enums.Enums;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "product_grade_prices")
@Data
public class ProductGradePrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private Enums.Currency currency= Enums.Currency.AZN;

    @Column(name = "manual_usd")
    private BigDecimal manualUsd;

    @Column(name = "manual_eur")
    private BigDecimal manualEur;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_model_id", nullable = false)
    private ProductModel productModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id", nullable = false)
    private LeatherGrade grade;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
