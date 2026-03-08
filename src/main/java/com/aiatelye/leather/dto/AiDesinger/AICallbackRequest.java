package com.aiatelye.leather.dto.AiDesinger;

import com.aiatelye.leather.enums.Enums;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AICallbackRequest {

    // Identifiers
    private Long designId;
    private String cacheKey;
    private Long userId;

    // AI Generation nəticəsi
    private String generatedImageBase64;  // AI tərəfindən yaradılmış şəkil (Base64)
    private String generatedImageUrl;     // Vəya direct URL (Gemini-dən gələn)

    // Metadata
    private Enums.DesignProcessStatus status;  // SUCCESS və ya FAILED
    private String promptUsed;             // n8n-də istifadə olunan final prompt
    private Long generationTimeMs;         // Generasiya vaxtı

    // Context (Event-dən gələnlər - logging/analytics üçün)
    private Long productModelId;
    private Long leatherId;
    private String productModelImageUrl;   // Orijinal məhsul şəkli
    private String leatherImageUrl;        // Orijinal dəri şəkli

    // Validation
    public boolean hasGeneratedImage() {
        return (generatedImageBase64 != null && !generatedImageBase64.isEmpty()) ||
                (generatedImageUrl != null && !generatedImageUrl.isEmpty());
    }

    public boolean isSuccess() {
        return status == Enums.DesignProcessStatus.SUCCESS && hasGeneratedImage();
    }
}
