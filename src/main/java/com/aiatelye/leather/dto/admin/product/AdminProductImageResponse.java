package com.aiatelye.leather.dto.admin.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductImageResponse {

    private Long id;
    private String imageUrl;      // DB: image_url
    private Integer imageOrder;   // DB: image_order
    private Boolean isPrimary;    // DB: is_primary
    private LocalDateTime createdAt;

}
