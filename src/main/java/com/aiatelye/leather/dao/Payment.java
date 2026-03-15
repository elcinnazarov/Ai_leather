package com.aiatelye.leather.dao;
import com.aiatelye.leather.dao.enums.Enums;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "provider_payment_id")
    private String providerPaymentId;

    @Column(name = "amount", precision = 19, scale = 4, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.Currency currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.PaymentStatus status;

    @Column(name = "raw_response", columnDefinition = "JSONB")
    private String rawResponse;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
}
