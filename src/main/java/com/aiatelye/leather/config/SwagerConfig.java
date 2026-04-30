package com.aiatelye.leather.config;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.AntPathMatcher;
@Configuration
public class SwagerConfig {

    // 1. Sənin SecurityConfig-dəki public ünvanların
    private static final String[] PUBLIC_URLS = {
            "/api/auth/register",
            "/api/auth/login",
            "/api/v1/customers",
            "/api/leathers/**",
            "/api/leatherGrade/**",
            "/api/products/**",
            "/api/cart/**",
            "/api/auth/**",
            "/api/designs/popular",
            "/api/designs/recent",
            "/api/internal/ai-callback",
            //swager
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/configuration/**",
            "/webjars/**",
            "/swagger-ui/index.html",
            "/error"
    };

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes("bearerToken",
                                new SecurityScheme()
                                        .name("bearerToken")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }

    // 2. Swagger-i avtomatlaşdıran əsas mexanizm
    @Bean
    public OpenApiCustomizer customizeOpenApi() {
        return openApi -> {
            AntPathMatcher matcher = new AntPathMatcher();

            openApi.getPaths().forEach((path, pathItem) -> {
                boolean isPublic = false;

                // Cari linkin PUBLIC_URLS içində olub-olmadığını yoxlayırıq
                for (String pattern : PUBLIC_URLS) {
                    if (matcher.match(pattern, path)) {
                        isPublic = true;
                        break;
                    }
                }

                // 3. Əgər link public DEYİLSƏ (yəni admin/order/design kimi qorunursa), qıfılı əlavə et
                if (!isPublic) {
                    pathItem.readOperations().forEach(operation ->
                            operation.addSecurityItem(new SecurityRequirement().addList("bearerToken"))
                    );
                }
            });
        };
    }
}