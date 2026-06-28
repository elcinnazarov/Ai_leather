package com.aiatelye.leather.dao;
import com.aiatelye.leather.dao.enums.Enums;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.UpdateTimestamp;

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
    private Long id;

    @Column(name = "model_name", nullable = false, unique = true)
    private String modelname;

    @Column(name = "model_type", nullable = false)
    private Enums.ProductCategory modelType; // WALLET, BAG, BELT

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "dimensions") // JSON format: {"width": 20, "height": 10}
    private String dimensions;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false)
    @Builder.Default
    private Enums.AvailabilityStatus availabilityStatus = Enums.AvailabilityStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 1-Cİ BAG XƏTASININ HƏLLİ
    @OneToMany(mappedBy = "productModel")
    @Fetch(FetchMode.SUBSELECT)
    private List<ProductGradePrice> gradePrices;

    // 2-Cİ BAG XƏTASININ HƏLLİ
    @OneToMany(mappedBy = "productModel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    private List<Favorite> favorites;

    // 3-CÜ BAG XƏTASININ HƏLLİ
    @OneToMany(mappedBy = "productModel", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("imageOrder ASC")
    @Fetch(FetchMode.SUBSELECT)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
