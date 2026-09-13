package com.aiatelye.leather.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;
import lombok.Setter;

import static org.hibernate.query.sqm.tree.SqmNode.log;

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
    /**
     * V1/V2 olan payriff endpointlerine istifade olunur. eyer card yadda saxlanilirsa
    private String approveRedirectUrl;
    private String cancelRedirectUrl;
    private String declineRedirectUrl;*/

    // ✅ Layihə başlayan kimi dəyərləri konsola yazdırır:
    @PostConstruct
    public void printLoadedProperties() {
        log.info("========== PAYRIFF CONFIG YOXLANIŞI ==========");
        log.info("Base URL: {}"+ baseUrl);
        log.info("Merchant ID: {}"+ merchantId);
        log.info("Callback URL: {}"+ callbackUrl);
        log.info("Secret Key Mövcuddur?: {}"+ (secretKey != null && !secretKey.isBlank()));
        if (secretKey != null && secretKey.length() > 6) {
            log.info("Secret Key (İlkin 6 simvol): {}******"+ secretKey.substring(0, 6));
        } else {
            log.warn("DIQQET: Secret Key BOŞDUR və ya oxunmayıb!");
        }
        log.info("===============================================");
    }
}
