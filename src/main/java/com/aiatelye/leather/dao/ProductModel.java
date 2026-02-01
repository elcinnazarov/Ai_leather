package com.aiatelye.leather.dao;
import com.aiatelye.leather.enums.Enums;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "product_models")
@Data
public class ProductModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(name = "model_name", nullable = false)
    private  String modelname;

    @Column(name = "model_type", nullable = false)
    private Enums.ModelType modelType; // WALLET, BAG, BELT

    @Column(name = "template_image_url")
    private String mainImageUrl; // Məhsulun əsas fotoşəkli (Kataloqda görünən və AI-ya ötürülən forma)

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "dimensions") // JSON format: {"width": 20, "height": 10}
    private String dimensions;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    private Enums.AvailabilityStatus availabilityStatus; // ACTIVE, DRAFT, ARCHIVED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "productModel")
    private List<ProductGradePrice> gradePrices;

    @OneToMany(mappedBy = "productModel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorite> favorites;

}
