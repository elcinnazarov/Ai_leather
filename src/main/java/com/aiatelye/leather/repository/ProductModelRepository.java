package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.ProductModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public interface ProductModelRepository extends JpaRepository<ProductModel,Long> ,
        JpaSpecificationExecutor<ProductModel> {

    boolean existsByModelnameIgnoreCaseAndIsActiveTrue(String modelname);
    boolean existsByModelnameIgnoreCaseAndIsActiveTrueAndIdNot(String modelName, Long id);

    @Query("SELECT p.modelname FROM ProductModel p WHERE p.id = :id")
    Optional<String> findModelNameById(@Param("id") Long id);


    Page<ProductModel> findAll(Specification<ProductModel> spec, Pageable pageable);

    /// Ən ucuz qiyməti tap (tək məhsul üçün)
    @Query("SELECT MIN(pgp.price) FROM ProductGradePrice pgp WHERE pgp.productModel.id = :productId")
    BigDecimal findMinPriceByProductId(@Param("productId") Long productId);

    /// DÜZƏLDİLMİŞ: Bütün məhsulların qiymətlərini bir query ilə çək
    @Query("SELECT pgp.productModel.id, pgp.grade.id, pgp.price " +
            "FROM ProductGradePrice pgp " +
            "WHERE pgp.productModel.id IN :productIds " +
            "ORDER BY pgp.price ASC")
    List<Object[]> findCheapestPricesByProductIds(@Param("productIds") List<Long> productIds);

    /// Helper metod: Object[]-ni Map-ə çevir
    default Map<Long, Long> getCheapestGradeMap(List<Long> productIds) {
        List<Object[]> priceData = findCheapestPricesByProductIds(productIds);

        /// Order by price ASC olduğu üçün ilk gələn hər product üçün ən ucuzudur
        return priceData.stream()
                .collect(Collectors.toMap(
                        data -> (Long) data[0],  // Product ID
                        data -> (Long) data[1],  // Grade ID
                        (existing, replacement) -> existing // Əgər duplicate varsa, birincini (ən ucuzunu) saxla
                ));
    }

    @EntityGraph(attributePaths = {"images", "gradePrices", "gradePrices.grade"})
    Optional<ProductModel> findById(Long id);

    @Query("SELECT pm FROM ProductModel pm " +
            "LEFT JOIN FETCH pm.images " +
            "LEFT JOIN FETCH pm.gradePrices pgp " +
            "LEFT JOIN FETCH pgp.grade " +
            "WHERE pm.id = :id")
    Optional<ProductModel> findByIdWithDetails(@Param("id") Long id);


    @Query("SELECT DISTINCT pm FROM ProductModel pm " +
            "LEFT JOIN FETCH pm.images " +
            "WHERE pm.id IN :ids AND pm.isActive = true " +
            "AND pm.availabilityStatus = 'ACTIVE'")
    List<ProductModel> findActiveByIds(@Param("ids") List<Long> ids);

}
