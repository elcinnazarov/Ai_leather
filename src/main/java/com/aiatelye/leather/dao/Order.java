package com.aiatelye.leather.dao;
import com.aiatelye.leather.dao.enums.Enums;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

    @Entity
    @Table(name = "orders")
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public class Order extends BaseEntity {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @Column(name = "order_number", unique = true, nullable = false, length = 50)
        private String orderNumber; // ORD-20260121-001
    
        @Column(name = "idempotency_key",unique = true,length = 100)
        private String idempotencyKey;
    
        @Column(name = "sub_total", precision = 19, scale = 4)
        private BigDecimal subTotal; // mehsul qiymeti . SNAPSHOT məlumatlar (dəyişməz)
    
        @Column(name = "shipping_fee", precision = 19, scale = 4)
        private BigDecimal shippingFee;
    
    
        @Column(name = "final_price", nullable = false)
        private BigDecimal finalPrice; // Dəyişməz qiymət
    
        @Column(name = "customer_email")
        private String customerEmail;
    
        @Column(name = "customer_phone")
        private String customerPhone;
    
        @Column(name = "postal_code", length = 20)
        private String postalCode;
    
        @Column(name = "delivery_address", columnDefinition = "TEXT")
        private String deliveryAddress;
    
        @Column(name = "notes", columnDefinition = "TEXT")
        private String notes;
    
        @Enumerated(EnumType.STRING)
        @Column(name = "order_type", nullable = false)
        private Enums.OrderType orderType;
    
        @Enumerated(EnumType.STRING)
        @Column(name = "design_status")
        private Enums.DesignProcessStatus designStatus;
    
    
        @Enumerated(EnumType.STRING)
        @Column(name = "currency", nullable = false)
        private Enums.Currency currency;
    
    
        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false)
        @Builder.Default
        private Enums.OrderStatus status = Enums.OrderStatus.PENDING;
    
        @Enumerated(EnumType.STRING)
        @Column(name = "payment_status", nullable = false)
        @Builder.Default
        private Enums.PaymentStatus paymentStatus = Enums.PaymentStatus.WAITING;

        @CreationTimestamp
        @Column(name = "created_at", nullable = false, updatable = false)
        private LocalDateTime createdAt;

        @UpdateTimestamp
        @Column(name = "updated_at")
        private LocalDateTime updatedAt;

        @Column(name = "paid_at")
        private LocalDateTime paidAt;
    
        @Column(name = "completed_at")
        private LocalDateTime completedAt;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", nullable = false)
        private User user;
    
        @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
        @Builder.Default
        private List<OrderItem> orderItems = new ArrayList<>();
    
        @OneToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
        @JoinColumn(name = "payment_id")
        private Payment payment;
    
    
    
        // ========== HELPER METODLAR ==========
    
        public void addOrderItem(OrderItem item) {
            orderItems.add(item);
            item.setOrder(this);
        }
    
        public void removeOrderItem(OrderItem item) {
            orderItems.remove(item);
            item.setOrder(null);
        }
    
        public void setPayment(Payment payment) {
            this.payment = payment;
            if (payment != null) {
                payment.setOrder(this);
            }
        }
    
        // ========== toString() - LAZY əlaqələri çıxar ==========
    
        @Override
        public String toString() {
            return "Order{" +
                    "id=" + id +
                    ", orderNumber='" + orderNumber + '\'' +
                    ", status=" + status +
                    ", subAmount=" + subTotal +
                    '}';
        }
    
    
    
    }
