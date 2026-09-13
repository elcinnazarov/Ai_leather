package com.aiatelye.leather.service.GeoIP;

import com.maxmind.geoip2.DatabaseReader;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.InetAddress;

@Service
@RequiredArgsConstructor
public class GeoIpService {

    private final DatabaseReader databaseReader;

    public String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // Lokal testlərdə localhost IP-si gəldikdə xarici ölkə (məs: ABŞ) simulyasiyası edir
        if ("0:0:0:0:0:0:0:1".equals(ip) || "127.0.0.1".equals(ip)) {
            return "8.8.8.8";
        }

        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    public String getCountryCode(String ipAddress) {
        try {
            return databaseReader.country(InetAddress.getByName(ipAddress))
                    .getCountry().getIsoCode();
        } catch (Exception e) {
            return null; // Xəta olarsa default valyutaya düşəcək
        }
    }
}