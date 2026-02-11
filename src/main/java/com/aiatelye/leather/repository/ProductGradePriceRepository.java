package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.PricingRule;
import com.aiatelye.leather.dao.ProductGradePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.lang.ScopedValue;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductGradePriceRepository extends JpaRepository<ProductGradePrice, Long> {

    boolean existsByProductModelIdAndGradeId(Long productModelId, Long gradeId);

    List<ProductGradePrice> findByProductModelId(Long productModelId);

    List<ProductGradePrice> findByProductModelIdOrderByGradeGradeLevelAsc(Long productModelId);

    Optional<ProductGradePrice> findByProductModelIdAndGradeId(Long productModelId, Long gradeId);

    Collection<ProductGradePrice> findByProductModelIdAndGradeIdIn(Long productModelId, Collection<Long> gradeIds);
}
