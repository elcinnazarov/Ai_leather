package com.aiatelye.leather.dao.enitity;
import com.aiatelye.leather.enums.Enums;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "orders")
@Data
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber; // ORD-20260121-001

    // SNAPSHOT məlumatlar (dəyişməz)
    @Column(name = "product_model_id")
    private Long productModelId;

    @Column(name = "product_model_name")
    private String productModelName; // "Çanta A"

    @Column(name = "leather_id")
    private Long leatherId;

    @Column(name = "leather_name")
    private String leatherName; // "Midnight Blue"

    @Column(name = "render_image_url")
    private String renderImageUrl; // Şəkil snapshot

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


    @ManyToOne(fetch =FetchType.LAZY )
    @JoinColumn(name = "user_id",nullable = false)
    private User user;


}
