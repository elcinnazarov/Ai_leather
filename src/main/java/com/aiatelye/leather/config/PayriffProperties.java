package com.aiatelye.leather.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;
import lombok.Setter;

/**
 * application.yml-dəki "payriff" prefiksli dəyərləri bu sinifə map edir.
 * Sirr (secret-key) heç vaxt kodda hardcode olunmur, env-dən gəlir.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "payriff")
public class PayriffProperties {

    private String baseUrl;
    private String merchantId;
    private String secretKey;
    private String callbackUrl;
    private String callbackToken;
    private String approveRedirectUrl;
    private String cancelRedirectUrl;
    private String declineRedirectUrl;
}
