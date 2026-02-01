package com.aiatelye.leather.dao;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "custom_design_usages",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"custom_design_id", "user_id"}
        )
)
@Data

public class CustomDesignUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_design_id", nullable = false)
    private CustomDesigns customDesign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt;
}
