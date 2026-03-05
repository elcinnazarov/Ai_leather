package com.aiatelye.leather.dao;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items",
        uniqueConstraints = @UniqueConstraint(
        columnNames = {"order_id", "product_model_id","leather_id"}))
@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Snapshot məlumatlar
    @Column(name = "product_model_id",nullable = false)
    private Long productModelId;

    @Column(name = "product_model_name",nullable = false)
    private String productModelName;

    @Column(name = "leather_id")
    private Long leatherId;

    @Column(name = "leather_name")
    private String leatherName;

    @Column(name = "render_image_url")
    private String renderImageUrl;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalPrice; // unitPrice * quantity

    @Column(name = "created_at" ,nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    public void calculateTotal() {
        if (this.unitPrice != null && this.quantity != null) {
            this.totalPrice = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
        } else {
            this.totalPrice = BigDecimal.ZERO;
        }

    }

}
