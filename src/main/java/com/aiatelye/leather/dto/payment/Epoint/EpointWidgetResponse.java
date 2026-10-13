package com.aiatelye.leather.dto.payment.Epoint;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class EpointWidgetResponse {

    private String status; // "success" və ya "error"

    @JsonProperty("widget_url")
    private String widgetUrl; // Google Pay düyməsi olan rəsmi ePoint səhifəsi
    private String transaction; // Bəzi hallarda ePoint ilkin transaction ID qaytarı
    private String message;

    public boolean isSuccess() {
        return "success".equalsIgnoreCase(this.status) && this.widgetUrl != null;
    }
}
