package com.aiatelye.leather.dao;
import com.aiatelye.leather.enums.Enums;
import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber; // ORD-20260121-001

    @Column(name = "sub_total", precision = 19, scale = 4)
    private BigDecimal subTotal; // mehsul qiymeti . SNAPSHOT məlumatlar (dəyişməz)

    @Column(name = "shipping_fee", nullable = false)
    private BigDecimal shippingFee; // cadirlma xerci

    @Column(name = "final_price", nullable = false)
    private BigDecimal finalPrice; // Dəyişməz qiymət


    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false)
    private Enums.OrderType orderType;

    @Enumerated(EnumType.STRING)
    private Enums.DesignProcessStatus designStatus; // GENERATING, SUCCESS, FAILED

    @Enumerated(EnumType.STRING)
    private Enums.Currency currency; // Sifariş anındakı valyuta

    @Enumerated(EnumType.STRING)
    private Enums.OrderStatus status; // PENDING-dən COMPLETED-ə qədər

    @Enumerated(EnumType.STRING)
    private Enums.PaymentStatus paymentStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

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
