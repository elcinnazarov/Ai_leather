package com.aiatelye.leather.service.GeoIP;

import com.maxmind.geoip2.DatabaseReader;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.InetAddress;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeoIpService {

    private final DatabaseReader databaseReader;

    public String getClientIp(HttpServletRequest request) {
        // 1. ✅ Cloudflare-dən gələn ən dəqiq real müştəri IP-si
        String ip = request.getHeader("CF-Connecting-IP");

        // 2. Əgər Cloudflare yoxdursa, standart proksi başlıqları
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Forwarded-For");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // Əgər proksi zəncirində vergüllə bir neçə IP gələrsə, ilk olanı (müştərini) götürürük
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        // Localhost və ya Docker daxili şəbəkəsi (172.x.x.x) üçün test simulyasiyası
        if ("0:0:0:0:0:0:0:1".equals(ip) || "127.0.0.1".equals(ip) || (ip != null && ip.startsWith("172."))) {
            return "8.8.8.8"; // Test üçün ABŞ IP-si
        }

        return ip;
    }

    public String getCountryCode(String ipAddress) {
        try {
            return databaseReader.country(InetAddress.getByName(ipAddress))
                    .getCountry().getIsoCode();
        } catch (Exception e) {
            log.warn("Could not resolve country for IP: {}. Error: {}", ipAddress, e.getMessage());
            return null; // Xəta olarsa USD-yə düşəcək
        }
    }

    // ✅ ƏLAVƏ GÜCLƏNDİRMƏ: Əgər sorğu Cloudflare-dən gəlirsə, birbaşa onun təyin etdiyi ölkəni götürür
    public String resolveCountry(HttpServletRequest request) {
        String cfCountry = request.getHeader("CF-IPCountry");
        if (cfCountry != null && !cfCountry.isEmpty() && !"XX".equalsIgnoreCase(cfCountry)) {
            return cfCountry.toUpperCase();
        }
        return getCountryCode(getClientIp(request));
    }
}
