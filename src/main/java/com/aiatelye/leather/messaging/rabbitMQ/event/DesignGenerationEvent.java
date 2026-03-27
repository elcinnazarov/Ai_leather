package com.aiatelye.leather.messaging.rabbitMQ.event;

import com.aiatelye.leather.dao.enums.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignGenerationEvent implements Serializable {

    private Long designId;
    private Long userId;
    private long productModelId;
    private long leatherId;
    private String productModelImageUrl;
    private String leatherImageUrl;
    private String userText;
    private Enums.Gender gender;
    private Enums.DesignCategory category;
    private String iconId;
    private String placementType;
    private String cacheKey;
    private Boolean isCustom;
    private Enums.DesignProcessStatus status;
    private LocalDateTime timestamp;

}
