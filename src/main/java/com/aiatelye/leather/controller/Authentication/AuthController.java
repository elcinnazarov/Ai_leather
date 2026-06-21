package com.aiatelye.leather.controller.Authentication;

import com.aiatelye.leather.Securty.service.AuthenticaionUserService;
import com.aiatelye.leather.dto.Securty.GoogleLoginRequestDto;
import com.aiatelye.leather.dto.Securty.LoginRequestDto;
import com.aiatelye.leather.dto.Securty.RegisterRequest;
import com.aiatelye.leather.Securty.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
 private final AuthService authService;
private final AuthenticaionUserService authenticaionUserService;
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody  @Valid RegisterRequest request) {
        return authService.register(request);
    }

    //  Bu metod əslində heç vaxt işləməyəcək!
    // Sorğu bura çatmamış JwtUsernameAndPasswordAuthenticationFilter tərəfindən tutulur.
    // Bu sadəcə Swagger-də görünmək üçündür.
    @PostMapping("/login")
    public void fakeLogin(@RequestBody LoginRequestDto request) {
        throw new IllegalStateException("Bu metod heç vaxt çağırılmamalıdır. Spring Security Filter işləyir.");
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequestDto request) {
        // Bu metod Google tokenini alacaq, yoxlayacaq və sənə XALİS JWT tokenini qaytaracaq.
        String jwtToken = authenticaionUserService.verifyGoogleAndGenerateJwt(request.getToken());

        // Frontend-in gözlədiyi formatda qaytarırıq: { "token": "..." }
        return ResponseEntity.ok(Map.of("token", jwtToken));
    }


}
