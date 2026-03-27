package com.aiatelye.leather.dto.AiDesinger;

import com.aiatelye.leather.dao.enums.Enums;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dizayn siyahısı elementi")
public class MyDesignsResponse {
    private Long designId;
    private String renderImageUrl;
    private Enums.DesignProcessStatus status;
    private String productModelName;
    private String leatherName;
    private String userText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer hitCount;
    private Boolean isPublic;

}
