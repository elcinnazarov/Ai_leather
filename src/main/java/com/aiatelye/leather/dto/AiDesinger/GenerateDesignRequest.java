package com.aiatelye.leather.dto.AiDesinger;

import com.aiatelye.leather.enums.Enums;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GenerateDesignRequest {
    @NotNull(message = "Məhsul modeli seçilməlidir")
    private Long productModelId;

    @NotNull(message = "Dəri növü seçilməlidir")
    private Long leatherId;

    // Smart Enrichment
    private Enums.Gender gender;
    private Enums.DesignCategory category;

    // Standart fərdiləşdirmə
    @Size(max = 50, message = "Mətn maksimum 50 simvol ola bilər")
    private String userText;

    private String iconId;
    private String placementType;

    // Advanced AI Mode
    @Size(max = 500, message = "Xüsusi təsvir maksimum 500 simvol ola bilər")
    private String customPrompt;

    public boolean isCustomRequest() {
        return customPrompt != null && !customPrompt.trim().isEmpty();
    }

}
