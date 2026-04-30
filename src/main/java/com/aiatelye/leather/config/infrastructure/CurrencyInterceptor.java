package com.aiatelye.leather.config.infrastructure;

import com.aiatelye.leather.common.CountryCurrencyMapper;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.service.GeoIP.GeoIpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
@Slf4j
@Component
@RequiredArgsConstructor
public class CurrencyInterceptor implements HandlerInterceptor {

    private final GeoIpService geoIpService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {

        // 1. Müştərinin real IP-sini tuturuq
        String ip = geoIpService.getClientIp(request);

        // 2. IP-dən ölkə kodunu (AZ, US, DE və s.) tapırıq
        String isoCode = geoIpService.getCountryCode(ip);

        // 3. Mapper vasitəsilə bu ölkə üçün bizim biznesin təyin etdiyi valyutanı tapırıq
        Enums.Currency currency = CountryCurrencyMapper.getCurrencyForIsoCode(isoCode);

        // 4. Tapılan valyutanı Context-ə set edirik (Sistem artıq bu valyuta ilə işləyəcək)
        CurrencyContext.setCurrency(currency);

        log.debug("GeoIP Resolve: IP: {}, Country: {}, Currency set to: {}", ip, isoCode, currency);

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        // ThreadLocal təmizlənməsi - Memory Leak-in qarşısını alan ən vacib addım
        CurrencyContext.clear();
    }
}
