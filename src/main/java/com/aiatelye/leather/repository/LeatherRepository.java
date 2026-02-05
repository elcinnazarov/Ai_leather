package com.aiatelye.leather.repository;


import com.aiatelye.leather.dao.Leather;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeatherRepository extends JpaRepository<Leather,Long> {

    boolean existsByLeathernameIgnoreCaseAndIsActiveTrue(String leatherName);

    boolean existsByLeathernameIgnoreCaseAndIsActiveTrue(String leatherName,Long leatherId);
}
