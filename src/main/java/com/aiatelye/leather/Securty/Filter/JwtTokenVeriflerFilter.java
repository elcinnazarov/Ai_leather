package com.aiatelye.leather.Securty.Filter;

import com.google.common.base.Strings;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
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

            // 🛠️ XƏTANIN HƏLL EDİLDİYİ YER: Təhlükəsiz oxuma (Safe Extract)
            List<?> authorities = body.get("authorities", List.class);
            Set<SimpleGrantedAuthority> simpleGrantedAuthorities = authorities.stream()
                    .map(auth -> {
                        Map<?, ?> authMap = (Map<?, ?>) auth; // Wildcard istifadə edərək təhlükəsiz çevirmə
                        return new SimpleGrantedAuthority((String) authMap.get("authority"));
                    })
                    .collect(Collectors.toSet());

            var usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    simpleGrantedAuthorities);
            usernamePasswordAuthenticationToken.setDetails(token); // Token-i saxla

            SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        filterChain.doFilter(request, response);

    }

}
