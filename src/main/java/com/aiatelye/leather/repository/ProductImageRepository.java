package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    @Modifying
    @Query("UPDATE ProductImage pi SET pi.isPrimary = false " +
            "WHERE pi.productModel.id = :productModelId")
    void clearPrimaryForProduct(Long productModelId);
}
