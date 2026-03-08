package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.CustomDesigns;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomDesignRepository extends JpaRepository<CustomDesigns, Long> {


    Optional<CustomDesigns> findByCacheKeyAndRenderImageUrlIsNotNull(String cacheKey);

    // Status endpoint üçün user ilə birlikdə çək
    @Query("SELECT d FROM CustomDesigns d " +
            "LEFT JOIN FETCH d.user " +
            "WHERE d.id = :id")
    Optional<CustomDesigns> findByIdWithUser(@Param("id") Long id);


    // Və ya sadə versiya (LAZY fetch də işləyir)
    Optional<CustomDesigns> findById(Long id);


    // Detail üçün - bütün məlumatları FETCH (N+1 problemini həll et)
    @Query("SELECT d FROM CustomDesigns d " +
            "LEFT JOIN FETCH d.user u " +
            "LEFT JOIN FETCH d.productModel pm " +
            "LEFT JOIN FETCH pm.images " +
            "LEFT JOIN FETCH d.leather l " +
            "LEFT JOIN FETCH l.grade " +
            "WHERE d.id = :id")
    Optional<CustomDesigns> findByIdWithUserAndProductAndLeather(@Param("id") Long id);

    // Public dizaynlar üçün (marketplace)
    @Query("SELECT d FROM CustomDesigns d " +
            "LEFT JOIN FETCH d.user " +
            "LEFT JOIN FETCH d.productModel " +
            "LEFT JOIN FETCH d.leather " +
            "WHERE d.isPublic = true AND d.status = 'COMPLETED'")
    List<CustomDesigns> findPublicDesigns(Pageable pageable);

}
