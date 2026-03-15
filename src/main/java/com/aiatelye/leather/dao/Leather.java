package com.aiatelye.leather.dao;

import com.aiatelye.leather.dao.enums.Enums;
import jakarta.persistence.*;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "leathers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Leather extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(name = "leather_name", nullable = false)
    private  String leathername;

    @Column(name = "texture_image_url", nullable = false)
    private String imageUrl;

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


    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false)
    @Builder.Default
    private Enums.AvailabilityStatus availabilityStatus = Enums.AvailabilityStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id",nullable = false)
    private LeatherGrade grade;

}
