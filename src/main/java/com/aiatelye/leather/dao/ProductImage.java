package com.aiatelye.leather.dao;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity
@Table(name = "product_images")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "image_order")
    private Integer imageOrder;

    @Column(name = "is_primary")
    private Boolean isPrimary;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isPrimary == null) isPrimary = false;
        if (imageOrder == null) imageOrder = 0;
    }


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_model_id", nullable = false)
    private ProductModel productModel;


}