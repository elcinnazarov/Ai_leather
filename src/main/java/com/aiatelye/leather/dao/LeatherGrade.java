package com.aiatelye.leather.dao;


import com.aiatelye.leather.enums.Enums;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "leather_grades")
@Data
public class LeatherGrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "grade_type",unique = true)
    private Enums.GradeType gradename;// STANDARD, PREMIUM, EXOTIC


    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "grade", cascade = CascadeType.ALL)
    private List<Leather> leathers;

    @OneToMany(mappedBy = "grade", cascade = CascadeType.ALL)
    private List<ProductGradePrice> productPrices;

}
