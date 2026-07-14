package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.DeliveryCountryConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryCountryConfigRepository extends JpaRepository<DeliveryCountryConfig, Long> {

    // Yalnız aktiv olanları tapmaq üçün (Frontend-ə göndərəcəyimiz list)
    List<DeliveryCountryConfig> findByIsActiveTrue();

    // Adminin statusunu dəyişməsi üçün ölkəni koda görə tapmaq
    Optional<DeliveryCountryConfig> findByCountryCode(String countryCode);

    // Seeder üçün: Ölkənin bazada olub-olmadığını yoxlamaq
    boolean existsByCountryCode(String countryCode);
}
