package com.aiatelye.leather.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // Yalnız lokal React (Vite və CRA) portlarına icazə verir
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
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