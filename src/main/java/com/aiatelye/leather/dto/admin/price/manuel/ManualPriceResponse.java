package com.aiatelye.leather.dto.admin.price.manuel;

import com.aiatelye.leather.enums.Enums;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ManualPriceResponse {
    private Long id;
    private Long productModelId;
    private String productModelName;
    private Long gradeId;
    private String gradeType;
    private Enums.Currency currency;      // USD/EUR
    private BigDecimal manualPrice;       // Manual qiymət
    private BigDecimal autoCalculated;    // Avtomatik hesablanan (müqayisə üçün)
    private Boolean isOverridden;         // true = manual istifadə olunur
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
