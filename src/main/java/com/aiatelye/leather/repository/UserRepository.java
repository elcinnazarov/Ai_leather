package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.ShippingLocation;
import com.aiatelye.leather.dao.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

}
