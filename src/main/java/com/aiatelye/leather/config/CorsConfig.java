package com.aiatelye.leather.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // React-in işlədiyi portları bura yazırıq (Vite üçün 5173, CRA üçün 3000)
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                // ƏN VACİB HİSSƏ: React-in bu başlıqları oxumasına və göndərməsinə icazə veririk
                .exposedHeaders("Authorization", "X-Currency", "Accept-Language")
                .allowCredentials(true);
    }
}