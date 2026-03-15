package com.aiatelye.leather.dao;


import com.aiatelye.leather.dao.enums.Enums;
import jakarta.persistence.*;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "custom_designs") // Adı düzəltdik: designs
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomDesigns extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "render_image_url") // nullable=false sildik, çünki əvvəl null olur
    private String renderImageUrl;

    @Column(name = "minio_object_key")
    private String minioObjectKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private Enums.DesignProcessStatus status = Enums.DesignProcessStatus.GENERATING;

    @Column(name = "prompt_used", columnDefinition = "TEXT")
    private String promptUsed;

    @Column(name = "custom_prompt", columnDefinition = "TEXT") // Əlavə edildi
    private String customPrompt;

    @Builder.Default
    @Column(name = "is_custom",nullable = false) // Əlavə edildi
    private boolean isCustom = false;

    @Column(name = "cache_key", unique = true)
    private String cacheKey;

    @Column(name = "hit_count")
    private Integer hitCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // Kimin dizaynı olduğunu bilmək üçün VACİBDİR
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_model_id", nullable = false)
    private ProductModel productModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leather_id", nullable = false)
    private Leather leather;


    @Column(name = "gender")
    @Enumerated(EnumType.STRING)
    private Enums.Gender gender;

    @Column(name = "category")
    @Enumerated(EnumType.STRING)
    private Enums.DesignCategory category;

    @Column(name = "user_text", length = 50)
    private String userText;

    @Column(name = "icon_id", length = 50)
    private String iconId;

    @Column(name = "placement_type", length = 20)
    private String placementType;

    @Builder.Default
    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;

}
