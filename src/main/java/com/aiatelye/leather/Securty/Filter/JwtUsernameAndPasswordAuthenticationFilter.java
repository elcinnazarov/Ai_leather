package com.aiatelye.leather.Securty.Filter;

import com.aiatelye.leather.Securty.model.UsernameAndPasswordAuthentication;
import com.aiatelye.leather.Securty.repository.AuthUserRepository;
import com.aiatelye.leather.componet.JwtTokenUtil;
import com.aiatelye.leather.dao.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Date;


public class JwtUsernameAndPasswordAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;
     private  final JwtTokenUtil jwtTokenUtil;
      private  final AuthUserRepository authUserRepository;

    public JwtUsernameAndPasswordAuthenticationFilter(
            AuthenticationManager authenticationManager,
            JwtTokenUtil jwtTokenUtil,
            AuthUserRepository authUserRepository) {

        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.authUserRepository = authUserRepository;
        setFilterProcessesUrl("/api/auth/login");
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
                                                HttpServletResponse response) throws AuthenticationException {
        try {
            UsernameAndPasswordAuthentication authRequest = new ObjectMapper()
                    .readValue(request.getInputStream(), UsernameAndPasswordAuthentication.class);

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    authRequest.getEmail(),
                    authRequest.getPassword()
            );

            return authenticationManager.authenticate(authenticationToken);

        } catch (IOException ex) {
            throw new RuntimeException("Giriş məlumatları oxuna bilmədi", ex);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication authResult) throws IOException, ServletException {

        String email = authResult.getName();

        // User obyekti çək (JwtTokenUtil üçün lazımdır)
        User user = authUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User tapılmadı"));

        // Sizin JwtTokenUtil metoduna uyğun: email, role, user
        String token = jwtTokenUtil.generateToken(
                email,
                user.getRole(),
                user
        );

        response.setContentType("application/json");
        response.getWriter().write("{\"token\":\"" + token + "\"}");
    }

}

