package com.aiatelye.leather.dao;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CalculatedPrice {

    private BigDecimal amount;
    private Enums.Currency currency;
    private String source;              // CACHE, BASE, MANUAL, AUTO
    private BigDecimal ruleMultiplier;  // AUTO üçün
    private BigDecimal ruleFixed;
}
