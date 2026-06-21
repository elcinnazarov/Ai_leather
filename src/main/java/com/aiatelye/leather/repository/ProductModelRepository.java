package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.ProductModel;
import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
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
    boolean existsByModelnameIgnoreCase(String modelname);
    boolean existsBymodelnameIgnoreCaseAndIsActiveTrue(String modelname);
    boolean existsBymodelnameIgnoreCaseAndIdNotAndIsActiveTrue(String modelName, Long id);

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

    // ✅ YENİ: Cache bypass, həmişə son vəziyyəti DB-dən oxuyur
    @Query("SELECT p FROM ProductModel p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.gradePrices WHERE p.id = :id")
    @QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "false"))
    Optional<ProductModel> findByIdWithFreshState(@Param("id") Long id);


    @Query("SELECT p FROM ProductModel p " +
            "LEFT JOIN FETCH p.images " +
            // DİQQƏT: gradePrices və ya favorites üçün JOIN FETCH YAZMA!
            "WHERE p.id = :id")
    Optional<ProductModel> findByIdWithDetails(@Param("id") Long id);


    @Query("SELECT DISTINCT pm FROM ProductModel pm " +
            "LEFT JOIN FETCH pm.images " +
            "WHERE pm.id IN :ids AND pm.isActive = true " +
            "AND pm.availabilityStatus = 'ACTIVE'")
    List<ProductModel> findActiveByIds(@Param("ids") List<Long> ids);


    @Query("SELECT pi.imageUrl FROM ProductImage pi " +
            "WHERE pi.productModel.id = :id AND pi.isPrimary = true")
    Optional<String> findPrimaryProductImageUrl(@Param("id") Long id);


}
