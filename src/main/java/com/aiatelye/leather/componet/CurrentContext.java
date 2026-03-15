package com.aiatelye.leather.componet;
import com.aiatelye.leather.error.Exception.UnauthorizedException;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Component
public class CurrentContext {
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("İstifadəçi daxil olmayıb");
        }

        // JwtTokenVerifierFilter-də qoyulan authorities-dən userId çıxar
        // Filter-də: claim("authorities", List.of(Map.of("authority", ...)))
        // Biz userId-ni birbaşa token-dən çıxarmalıyıq

        String token = extractTokenFromAuthentication(authentication);
        return extractUserIdFromToken(token);
    }

    private String extractTokenFromAuthentication(Authentication authentication) {
        // Authentication details-də token saxlanıbsa
        if (authentication.getDetails() instanceof String) {
            return (String) authentication.getDetails();
        }
        return null;
    }

    private Long extractUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor("supersecretkeythatshouldbeatleast32characterslong".getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("userId", Long.class);
    }

    public boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;

        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }

    // DesignDetailService-dəki metod üçün
    public boolean UseROle(String role) {
        return hasRole(role);
    }

    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;

        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role));
    }
}