package com.aiatelye.leather.dto.order;

import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.validators.ValidPostalCodeByCountry;
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
@ValidPostalCodeByCountry
public class CreateOrderRequest {
    @NotNull(message = "Order type must be selected")
    private Enums.OrderType orderType;

    @NotNull(message = "Country must be selected")
    private Enums.Country country;

    private String cityName; // null = country default

    private String postalCode; // ✅ NEW: can be null (for Azerbaijan)

    @NotNull(message = "Delivery address must be filled")
    private String deliveryAddress;

    @NotNull(message = "WhatsApp number must be entered")
    private String customerPhone;

    private String notes;

    @NotNull(message = "Currency must be selected")
    private Enums.Currency currency;

    @NotEmpty(message = "Cart cannot be empty")
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
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;

        @NotNull
        private BigDecimal unitPrice;
    }
}