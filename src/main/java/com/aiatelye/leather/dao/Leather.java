package com.aiatelye.leather.dao;

import com.aiatelye.leather.enums.Enums;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "leathers")
@Data
public class Leather {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(name = "leather_name", nullable = false)
    private  String leathername;

    @Column(name = "texture_image_url", nullable = false)
    private String imageUrl; // AI-nın "geyindirəcəyi" tekstura

    private String color; // "Black", "Brown", "Red"

    private String origin; // "Italy", "Turkey", "France"

    private Integer stockAmount;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private Enums.AvailabilityStatus availabilityStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id",nullable = false)
    private LeatherGrade grade;

}
