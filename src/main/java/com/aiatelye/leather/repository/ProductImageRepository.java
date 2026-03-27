package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    @Modifying
    @Query("UPDATE ProductImage pi SET pi.isPrimary = false " +
            "WHERE pi.productModel.id = :productModelId")
    void clearPrimaryForProduct(Long productModelId);


    @Query("SELECT pi FROM ProductImage pi " +
            "WHERE pi.productModel.id IN :productIds " +
            "AND pi.isPrimary = true")
    List<ProductImage> findPrimaryImagesByProductIds(@Param("productIds") List<Long> productIds);




}
