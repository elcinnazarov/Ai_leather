package com.aiatelye.leather.dao;
import com.aiatelye.leather.enums.Enums;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_models")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductModel{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(name = "model_name", nullable = false)
    private  String modelname;

    @Column(name = "model_type", nullable = false)
    private Enums.ProductCategory modelType; // WALLET, BAG, BELT

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "dimensions") // JSON format: {"width": 20, "height": 10}
    private String dimensions;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false)
    @Builder.Default
    private Enums.AvailabilityStatus availabilityStatus = Enums.AvailabilityStatus.DRAFT;

    @Column(name = "created_at",nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "productModel")
    private List<ProductGradePrice> gradePrices;

    @OneToMany(mappedBy = "productModel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorite> favorites;

    @OneToMany(mappedBy = "productModel", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("imageOrder ASC")
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }


}
