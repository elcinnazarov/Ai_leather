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
public class CartPreviewRequest {

    @NotEmpty(message = "Səbət boş ola bilməz")
    @Valid
    private List<CartItemRequest> items;

    @NotNull(message = "Valyuta seçilməlidir")
    private Enums.Currency currency;

    @Data
    @Builder
    public static class CartItemRequest {
        @NotNull
        private Long productModelId;

        @NotNull
        private Long leatherId;

        @NotNull
        @Min(value = 1, message = "Say minimum 1 olmalıdır")
        private Integer quantity;

        /**
         * Müştərinin frontend-də (kataloqda) gördüyü vahid qiymət.
         * Backend bunu real qiymətlə müqayisə edəcək.
         */
        @NotNull
        private BigDecimal seenPrice;

        /**
         * Əgər AI dizaynı edilibsə, render linki buraya gəlir.
         * Boşdursa, sistem standart kataloq şəklini götürəcək.
         */
        private String customRenderUrl;
    }
}
