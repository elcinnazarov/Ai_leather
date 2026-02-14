package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.ProductModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
    public interface ProductModelRepository extends JpaRepository<ProductModel,Long> {

        boolean existsByModelnameIgnoreCaseAndIsActiveTrue(String modelname);
        boolean existsByModelnameIgnoreCaseAndIsActiveTrueAndIdNot(String modelName, Long id);

        @Query("SELECT p.modelname FROM ProductModel p WHERE p.id = :id")
        Optional<String> findModelNameById(@Param("id") Long id);

    }
