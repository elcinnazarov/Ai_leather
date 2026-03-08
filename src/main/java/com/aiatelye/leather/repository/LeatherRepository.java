package com.aiatelye.leather.repository;


import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.enums.Enums;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface LeatherRepository extends JpaRepository<Leather,Long> {

    boolean existsByleathernameIgnoreCaseAndIsActiveTrue(String leatherName);

    boolean existsByleathernameIgnoreCaseAndIdNotAndIsActiveTrue(String leatherName, Long leatherId);

    @Query("""
        SELECT DISTINCT l FROM Leather l
        JOIN FETCH l.grade lg
        JOIN ProductGradePrice pgp ON pgp.grade.id = lg.id
        WHERE pgp.productModel.id = :productId
        AND l.isActive = true
        AND l.availabilityStatus = 'ACTIVE'
        ORDER BY l.leathername
        """)
    List<Leather> findAvailableLeathersByProductId(@Param("productId") Long productId);

    // N+1 həlli: grade ilə birlikdə çək
    @EntityGraph(attributePaths = {"grade"})
    Page<Leather> findAll(Specification<Leather> spec, Pageable pageable);


    // Detallar üçün - grade və əlaqəli məhsullar ilə
    @EntityGraph(attributePaths = {"grade", "grade.productPrices", "grade.productPrices.productModel"})
    Optional<Leather> findById(Long id);

    // Və ya daha kontrollu JOIN FETCH
    @Query("SELECT l FROM Leather l " +
            "LEFT JOIN FETCH l.grade g " +
            "LEFT JOIN FETCH g.productPrices pgp " +
            "LEFT JOIN FETCH pgp.productModel pm " +
            "WHERE l.id = :id")
    Optional<Leather> findByIdWithDetails(@Param("id") Long id);


    /**
     * Grade-ə görə dərilər (sadə, təkcə həmin grade)
     */
    @EntityGraph(attributePaths = {"grade"})
    @Query("SELECT l FROM Leather l " +
            "WHERE l.grade.gradeType = :gradeType " +
            "AND l.isActive = true " +
            "AND l.availabilityStatus = 'ACTIVE'")
    Page<Leather> findByGradeType(@Param("gradeType") Enums.GradeType gradeType, Pageable pageable);





    /**
     * Bütün grade-lər + hər birində neçə dəri olduğu
     * Sıralama: gradename ilə (STANDARD, PREMIUM, EXOTIC)
     */
    @Query("SELECT g, COUNT(l) FROM LeatherGrade g " +
            "LEFT JOIN g.leathers l " +
            "WHERE g.isActive = true " +
            "GROUP BY g " +
            "ORDER BY g.gradeType")
    List<Object[]> findAllWithLeatherCount();

    /*
     * Sadə versiya

    List<LeatherGrade> findByIsActiveTrueOrderByGradenameAsc();*/

    @Query("SELECT DISTINCT l FROM Leather l " +
            "LEFT JOIN FETCH l.grade g " +
            "WHERE l.id IN :ids AND l.isActive = true " +
            "AND l.availabilityStatus = 'ACTIVE'")
    List<Leather> findActiveByIds(@Param("ids") List<Long> ids);


    @Query("SELECT l.imageUrl FROM Leather l WHERE l.id = :id")
    Optional<String> findLeatherImageUrl(@Param("id") Long id);

}
