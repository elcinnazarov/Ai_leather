package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.ProductModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

    @Repository
    public interface ProductModelRepository extends JpaRepository<ProductModel,Long> {

        boolean existsByModelnameIgnoreCaseAndIsActiveTrue(String modelname);
        boolean existsByModelnameIgnoreCaseAndIsActiveTrueAndIdNot(String modelName, Long id);

    }
