package com.aiatelye.leather.dao.enitity;
import com.aiatelye.leather.enums.Enums;
import jakarta.persistence.*;
import lombok.Data;

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
    @Column(name = "target_type", nullable = false)
    private Enums.FavoriteTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long productModelId;

    @Column(name = "target_name")
    private String targetName; // snapshot (opsional)

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}
