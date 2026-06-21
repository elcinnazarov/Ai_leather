package com.aiatelye.leather.Securty.Configuration;

import com.aiatelye.leather.Securty.Filter.JwtTokenVeriflerFilter;
import com.aiatelye.leather.Securty.Filter.JwtUsernameAndPasswordAuthenticationFilter;
import com.aiatelye.leather.Securty.repository.AuthUserRepository;
import com.aiatelye.leather.Securty.service.AuthenticaionUserService;
import com.aiatelye.leather.componet.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static com.aiatelye.leather.Securty.model.Enums.UserRole.ADMIN;
import static com.aiatelye.leather.Securty.model.Enums.UserRole.CUSTOMER;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurtyConfiguration {

    private final AuthenticaionUserService authenticaionUserService;
    private final PasswordConfiguration passwordConfigartion;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthUserRepository authUserRepository;

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
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   AuthenticationConfiguration authConfig) throws Exception {

        AuthenticationManager authenticationManager = authConfig.getAuthenticationManager();

        JwtUsernameAndPasswordAuthenticationFilter loginFilter =
                new JwtUsernameAndPasswordAuthenticationFilter(
                        authenticationManager,
                        jwtTokenUtil,
                        authUserRepository);

          http
                  .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_URLS).permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/customers/**").hasRole(ADMIN.name())
                        .requestMatchers("/api/admin/**").hasRole(ADMIN.name())
                        .requestMatchers("/api/designs/generate").hasRole(CUSTOMER.name())
                        .requestMatchers("/api/orders").hasAuthority("order:create")
                        .anyRequest().authenticated())
                  .cors(Customizer.withDefaults()) // 👈 DİQQƏT: BUNU MÜTLƏQ ƏLAVƏ ET!
                .authenticationManager(authenticationManager)
                .authenticationProvider(daoAuthenticationProvider())
                  .csrf(AbstractHttpConfigurer::disable)
                  .sessionManagement(session ->
                          session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(new JwtTokenVeriflerFilter(),
                        UsernamePasswordAuthenticationFilter.class)
                .addFilter(loginFilter);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        var provider = new DaoAuthenticationProvider(authenticaionUserService);
        provider.setPasswordEncoder(passwordConfigartion.passwordEncoder());
        return provider;
    }
}
