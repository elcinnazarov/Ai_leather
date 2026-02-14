package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    @Query("SELECT o FROM Order o " +
            "LEFT JOIN FETCH o.user " +
            "LEFT JOIN FETCH o.orderItems " +
            "LEFT JOIN FETCH o.payment " +
            "WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(Long id);


    // Status update üçün sadə fetch (optimistic locking üçün)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(Long id);
}
