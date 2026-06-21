package com.aiatelye.leather.dto.admin.product;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminGradePriceResponse {

    private Long id;
    private Long gradeId;
    private Enums.GradeType gradeType;
    private BigDecimal price;           // AZN base price
    private String currency;            // AZN
    private BigDecimal manualUsd;       // Manual override
    private BigDecimal manualEur;       // Manual override
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
