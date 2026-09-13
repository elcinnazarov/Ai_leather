package com.aiatelye.leather.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Value;
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.frontend-url:https://e1000leather.com}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",
                        "http://localhost:3000",
                        "https://e1000leather.com",
                        "https://www.e1000leather.com",
                        frontendUrl
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders(
                        "Authorization",
                        "X-Currency",
                        "Accept-Language",
                        "X-Currency-Symbol",
                        "X-Region"
                )
                .allowCredentials(true);
    }
}