package com.aiatelye.leather.dto.order;

import com.aiatelye.leather.dao.enums.Enums;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CreateOrderRequest {
    @NotNull(message = "Sifariş tipi seçilməlidir")
    private Enums.OrderType orderType;

    @NotNull(message = "Ölkə seçilməlidir")
    private Enums.Country country;

    private String cityName; // null = ölkə standartı

    private String postalCode; // ✅ YENİ: null ola bilər (Azərbaycan üçün)

    @NotNull(message = "Çatdırılma ünvanı doldurulmalıdır")
    private String deliveryAddress;

    private String customerPhone;

    private String notes;

    @NotNull(message = "Valyuta seçilməlidir")
    private Enums.Currency currency;

    @NotEmpty(message = "Səbət boş ola bilməz")
    @Valid
    private List<OrderItemRequest> items;

    private String idempotencyKey;

    @Data
    @Builder
    public static class OrderItemRequest {
        @NotNull
        private Long productModelId;

        private String productModelName;

        @NotNull
        private Long leatherId;

        private String leatherName;

        private String renderImageUrl;

        private Long designId;

        @NotNull
        @Min(value = 1, message = "Say minimum 1 olmalıdır")
        private Integer quantity;

        @NotNull
        private BigDecimal unitPrice;
    }

}
