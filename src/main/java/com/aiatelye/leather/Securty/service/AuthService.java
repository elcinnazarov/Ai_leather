package com.aiatelye.leather.Securty.service;

import com.aiatelye.leather.Securty.Configuration.PasswordConfiguration;
import com.aiatelye.leather.Securty.model.Enums.UserRole;
import com.aiatelye.leather.Securty.repository.AuthUserRepository;
import com.aiatelye.leather.componet.JwtTokenUtil;
import com.aiatelye.leather.dao.User;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.dto.Securty.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordConfiguration passwordConfiguration;
    private final JwtTokenUtil jwtTokenUtil;

    public ResponseEntity<?>    register(RegisterRequest request) {
        try {
            if (authUserRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("{\"error\":\"Email already exists\"}");
            }

            User newUser = new User();
            newUser.setEmail(request.getEmail());
            newUser.setPassword(passwordConfiguration.passwordEncoder().encode(request.getPassword()));
            newUser.setName(request.getName());
            newUser.setRole(UserRole.CUSTOMER);
            newUser.setProvider(Enums.AuthProvider.LOCAL);
            newUser.setIsActive(true);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());

            authUserRepository.save(newUser);


            String token = jwtTokenUtil.generateToken(
                    newUser.getEmail(),
                    newUser.getRole(),
                    newUser
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .header("Content-Type", "application/json")
                    .body("{\"token\":\"" + token + "\"}");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
