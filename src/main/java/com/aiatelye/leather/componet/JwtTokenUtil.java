package com.aiatelye.leather.componet;

import com.aiatelye.leather.Securty.model.Enums.UserRole;
import com.aiatelye.leather.dao.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.util.List;
import java.util.Map;



@Component
public class JwtTokenUtil {

    private static final String SECRET = "supersecretkeythatshouldbeatleast32characterslong";
    private static final long EXPIRATION = 100L * 60 * 60 * 24 * 14; // 14 gün

    public String generateToken(String email, UserRole role, User user) {
        return Jwts.builder()
                .setSubject(email)
                .claim("authorities", List.of(Map.of("authority", "ROLE_" + role.name())))
                .claim("userId", user.getId()) // ID-ni tokene qoyuruq!
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes()))
                .compact();
    }
}
