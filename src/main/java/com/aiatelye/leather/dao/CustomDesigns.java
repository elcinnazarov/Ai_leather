package com.aiatelye.leather.dao;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;


@Entity
@Table(name = "custom_desings")
@Data
public class CustomDesigns {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "render_image_url", nullable = false)
    private String renderImageUrl; // Gemini yaratdığı şəkil

    @Column(name = "prompt_used", columnDefinition = "TEXT")
    private String promptUsed; // Gemini-yə göndərilən prompt

    @Column(name = "price_at_generation")
    private Double priceAtGeneration; // Snapshot qiymət

    @Column(name = "cache_key", unique = true)
    private String cacheKey; // Redis key: model:123:leather:45

    @Column(name = "hit_count")
    private Integer hitCount = 0; // Neçə dəfə istifadə edilib

    @Column(name = "generation_time_ms")
    private Long generationTimeMs; // AI nə qədər çəkdi

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Redis Key üçün unikal birləşmə: model:{id}:leather:{id}
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_model_id", nullable = false)
    private ProductModel productModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leather_id", nullable = false)
    private Leather leather;

}
