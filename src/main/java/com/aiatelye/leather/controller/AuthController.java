package com.aiatelye.leather.controller;

import com.aiatelye.leather.dto.admin.Securty.LoginRequestDto;
import com.aiatelye.leather.dto.admin.Securty.RegisterRequest;
import com.aiatelye.leather.service.Securty.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
 private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    //  Bu metod əslində heç vaxt işləməyəcək!
    // Sorğu bura çatmamış JwtUsernameAndPasswordAuthenticationFilter tərəfindən tutulur.
    // Bu sadəcə Swagger-də görünmək üçündür.
    @PostMapping("/login")
    public void fakeLogin(@RequestBody LoginRequestDto request) {
        throw new IllegalStateException("Bu metod heç vaxt çağırılmamalıdır. Spring Security Filter işləyir.");
    }



}
