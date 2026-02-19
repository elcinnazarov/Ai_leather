package com.aiatelye.leather.dao;

import com.aiatelye.leather.enums.Enums;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "leathers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Leather {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(name = "leather_name", nullable = false)
    private  String leathername;

    @Column(name = "texture_image_url", nullable = false)
    private String imageUrl; // AI-nın "geyindirəcəyi" tekstura

    @Column(name = "color",nullable = false)
    private String color; // "Black", "Brown", "Red"

    @Column(name = "origin",nullable = false)
    private String origin; // "Italy", "Turkey", "France"

    @Column(name = "description",nullable = false)
    private  String description;
    /*@Column(name = "stock_amount")
     //private Integer stockAmount;*/

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false)
    @Builder.Default
    private Enums.AvailabilityStatus availabilityStatus = Enums.AvailabilityStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id",nullable = false)
    private LeatherGrade grade;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
