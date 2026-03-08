package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.UserLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserLimitRepository extends JpaRepository<UserLimit, Long> {
    Optional<UserLimit> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

}
