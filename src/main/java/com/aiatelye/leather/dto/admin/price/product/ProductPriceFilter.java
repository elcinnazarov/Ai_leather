package com.aiatelye.leather.dto.admin.price.product;

import com.aiatelye.leather.enums.Enums;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductPriceFilter {
    private Long productId;

    private Long gradeId;

    private Enums.Currency currency;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // Pagination
    private int page = 0;
    private int size = 20;

}
