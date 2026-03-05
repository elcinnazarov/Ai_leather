package com.aiatelye.leather.dto.admin.shiping;

import com.aiatelye.leather.enums.Enums;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminShippingLocationResponse {

    private Long id;
    private Enums.Country country;
    private String cityName;
    private BigDecimal fee;
    private Enums.Currency currency;
    private BigDecimal freeThreshold;
    private Boolean requiresPostalCode;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
