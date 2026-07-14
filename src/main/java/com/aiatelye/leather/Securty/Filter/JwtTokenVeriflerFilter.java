package com.aiatelye.leather.Securty.Filter;

import com.google.common.base.Strings;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class JwtTokenVeriflerFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (Strings.isNullOrEmpty(authorizationHeader) || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authorizationHeader.substring(7);

            Jws<Claims> claimsJws = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor("supersecretkeythatshouldbeatleast32characterslong".getBytes()))
                    .build()
                    .parseClaimsJws(token);

            Claims body = claimsJws.getBody();
            String username = body.getSubject();

            List<?> authorities = body.get("authorities", List.class);
            Set<SimpleGrantedAuthority> simpleGrantedAuthorities = authorities.stream()
                    .map(auth -> {
                        Map<?, ?> authMap = (Map<?, ?>) auth;
                        return new SimpleGrantedAuthority((String) authMap.get("authority"));
                    })
                    .collect(Collectors.toSet());

            var authenticationToken = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    simpleGrantedAuthorities);
            authenticationToken.setDetails(token);

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

        } catch (ExpiredJwtException e) {
            // ✅ DƏYİŞİKLİK YALNIZ BURDADIR:
            // Əvvəl: anonim kimi davam edirdi → sonra CUSTOMER endpoint-ə girəndə problem olurdu
            // İndi: birbaşa 401 qaytar, filterChain-i DAYANDIR
            logger.warn("JWT Token vaxtı bitib: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"TOKEN_EXPIRED\",\"message\":\"Sessiyanın müddəti bitib, yenidən daxil olun\"}");
            return; // ← filterChain.doFilter ÇAĞIRILMIR

        } catch (JwtException e) {
            logger.warn("Geçərsiz JWT Token: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"INVALID_TOKEN\"}");
            return; // ← filterChain.doFilter ÇAĞIRILMIR

        } catch (Exception e) {
            logger.error("Token yoxlanarkən gözlənilməz xəta: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}