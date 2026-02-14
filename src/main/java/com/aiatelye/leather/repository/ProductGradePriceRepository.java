package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.ProductGradePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;


@Repository
public interface ProductGradePriceRepository extends JpaRepository<ProductGradePrice, Long> {

    boolean existsByProductModelIdAndGradeId(Long productModelId, Long gradeId);

    List<ProductGradePrice> findByProductModelId(Long productModelId);

    List<ProductGradePrice> findByProductModelIdOrderByGradeGradeLevelAsc(Long productModelId);

    Optional<ProductGradePrice> findByProductModelIdAndGradeId(Long productModelId, Long gradeId);

    Collection<ProductGradePrice> findByProductModelIdAndGradeIdIn(Long productModelId, Collection<Long> gradeIds);


    @Query("SELECT p.grade.id FROM ProductGradePrice p WHERE p.productModel.id = :productId")
    Set<Long> findAllGradeIdsByProductModelId(@Param("productId") Long productId);

    @Query("SELECT gp FROM ProductGradePrice gp JOIN FETCH gp.grade WHERE gp.productModel.id = :productId")
    List<ProductGradePrice> findAllByProductModelIdWithGrade(@Param("productId") Long productId);
}
