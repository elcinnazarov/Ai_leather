package com.aiatelye.leather.componet;

import com.aiatelye.leather.Securty.model.Enums.UserRole;
import com.aiatelye.leather.dao.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.util.List;
import java.util.Map;



@Component
public class JwtTokenUtil {

    @Value("${jwt.secret}")
    private String secretKeyString;
    private static final long EXPIRATION = 1000L * 60 * 60 * 24 * 30; // 30 gün

    public String generateToken(String email, UserRole role, User user) {
        return Jwts.builder()
                .setSubject(email)
                .claim("authorities", List.of(Map.of("authority", "ROLE_" + role.name())))
                .claim("userId", user.getId()) // ID-ni tokene qoyuruq!
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(Keys.hmacShaKeyFor(secretKeyString.getBytes()))
                .compact();
    }
}
