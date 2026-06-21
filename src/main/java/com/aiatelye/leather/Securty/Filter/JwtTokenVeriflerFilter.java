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

            // 1. Token yoxdursa, birbaşa növbəti qapıya (filtrə) ötürürük
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

                // SƏNİN YAZDIĞIN MÖHTƏŞƏM "SAFE EXTRACT" KODU
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

                // Adamı sistemə tanıtdıq
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            } catch (ExpiredJwtException e) {
                // 🛠️ HƏLL: Tokenin vaxtı bitibsə SİSTEMİ ÇÖKDÜRMÜRÜK!
                logger.warn("JWT Token vaxtı bitib, istifadəçi anonim kimi davam edəcək: " + e.getMessage());
                request.setAttribute("expired", e.getMessage());
            } catch (JwtException e) {
                // Saxta və ya pozulmuş token gələrsə
                logger.warn("Geçərsiz JWT Token: " + e.getMessage());
            } catch (Exception e) {
                // Digər gözlənilməz xətalar üçün
                logger.error("Token yoxlanarkən gözlənilməz xəta: " + e.getMessage());
            }

            // ƏN VACİB SƏTİR: Xəta olsa da, olmasa da ZƏNCİR QIRILMAMALIDIR!
            // (Bunu catch bloklarının çölünə yazırıq ki, mütləq işləsin)
            filterChain.doFilter(request, response);
        }

}
