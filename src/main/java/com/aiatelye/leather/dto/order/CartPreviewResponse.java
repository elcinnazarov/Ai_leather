package com.aiatelye.leather.dto.order;

import com.aiatelye.leather.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartPreviewResponse {


    private Boolean valid; // Bütün səbət keçərlidirmi?
    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
    private Enums.Currency currency;
    private List<String> globalErrors;

    @Data
    @Builder
    public static class CartItemResponse {
        private Long productModelId;
        private String productModelName;
        private Long leatherId;
        private String leatherName;

        // Şəkil məntiqi: customRenderUrl varsa o, yoxdursa kataloq şəkli
        private String finalImageUrl;

        private Integer quantity;
        private BigDecimal currentUnitPrice; // Redis-dən gələn ən son qiymət
        private BigDecimal oldSeenPrice; // Müştərinin gördüyü köhnə qiymət
        private BigDecimal totalPrice;

        // Status Flag-ləri
        private Boolean priceChanged;
       // private Boolean stockSufficient; yoxdur
        private Boolean available;
        private Boolean isCustomDesign;

        private String itemErrorMessage;
    }
}
