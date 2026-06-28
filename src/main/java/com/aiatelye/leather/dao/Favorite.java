package com.aiatelye.leather.dao;
import com.aiatelye.leather.dao.enums.Enums;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table( name = "favorites",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"user_id", "target_type", "target_id"}))
@Data
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "favorite_model_type", nullable = false)
    private Enums.FavoriteTargetType targetType;

    @Column(name = "favorite_model_id", nullable = false)
    private Long productModelId;

    @Column(name = "favorite_model_name")
    private String targetName; // snapshot (opsional)

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_model_id")
    private ProductModel productModel;

}
