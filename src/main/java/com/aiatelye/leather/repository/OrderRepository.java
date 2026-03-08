package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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


    @Query("SELECT o FROM Order o" +
            " LEFT JOIN FETCH o.orderItems " +
            "LEFT JOIN FETCH o.user " +
            "WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    boolean existsByOrderNumber(String orderNumber);

    // Idempotency check - son 5 dəqiqə ərzində eyni idempotency key ilə order varmı?
    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o " +
            "WHERE o.user.id = :userId AND o.createdAt > :since AND o.idempotencyKey = :idempotencyKey")
    boolean existsRecentByUserAndIdempotencyKey(@Param("userId") Long userId,
                                                @Param("idempotencyKey") String idempotencyKey,
                                                @Param("since") java.time.LocalDateTime since);



    Page<Order> findByUserId(long userId, Pageable pageable);

    @Query("SELECT o FROM Order o " +
            "LEFT JOIN FETCH o.orderItems " +
            "LEFT JOIN FETCH o.payment" +
            " WHERE o.id = :id")
    Optional<Order> findByIdWithDetailswithuser(@Param("id") Long id);

}
