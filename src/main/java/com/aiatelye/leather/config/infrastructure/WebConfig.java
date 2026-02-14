package com.aiatelye.leather.config.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final CurrencyInterceptor currencyInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(currencyInterceptor)
                .addPathPatterns("/api/**")  // Bütün API-lərə tətbiq et
                .excludePathPatterns("/api/auth/**"); // Auth-ları çıxar
    }
}