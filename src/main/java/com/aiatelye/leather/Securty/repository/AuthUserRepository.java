package com.aiatelye.leather.Securty.repository;

import com.aiatelye.leather.dao.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthUserRepository  extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
