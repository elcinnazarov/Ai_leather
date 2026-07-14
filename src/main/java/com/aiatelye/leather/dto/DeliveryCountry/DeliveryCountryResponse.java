package com.aiatelye.leather.dto.DeliveryCountry;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Builder
public class DeliveryCountryResponse {
    private Long id;
    private String countryCode;
    private String countryName;
    private Boolean isActive;
    private LocalDateTime disabledAt;
    private String disabledBy;
}
