package com.aiatelye.leather.config;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "epoint")
public class EpointProperties {
    /**
     * ePoint API əsas URL-i (default: https://epoint.az/api/1)
     */
    private String baseUrl = "https://epoint.az/api/1";

    /**
     * ePoint tərəfindən verilən tacir ID (Nümunə: i000000001)
     */
    private String publicKey;

    /**
     * ePoint tərəfindən verilən gizli imza açarı
     */
    private String privateKey;

    /**
     * Uğurlu ödənişdən sonra yönləndirmə URL-i
     */
    private String successRedirectUrl = "https://e1000leather.com/payment/success?status=success";

    /**
     * Uğursuz ödənişdən sonra yönləndirmə URL-i
     */
    private String errorRedirectUrl = "https://e1000leather.com/payment/failed?status=failed";
}
