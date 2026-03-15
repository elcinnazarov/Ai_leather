package com.aiatelye.leather.dto.admin.price.product;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Data
@Builder
public class ProductPriceFilterResponse {

    private Long id;
    private Long productModelId;
    private String productModelName;
    private Long gradeId;
    private String gradeName; // STANDARD, PREMIUM, EXOTIC


    private BigDecimal basePrice; // AZN (əsas)
    private BigDecimal manualUsd;
    private BigDecimal manualEur;

    private BigDecimal calculatedUsd;
    private BigDecimal calculatedEur;

    private Enums.Currency currency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
