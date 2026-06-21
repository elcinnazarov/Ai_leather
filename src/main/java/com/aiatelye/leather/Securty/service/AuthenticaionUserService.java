package com.aiatelye.leather.Securty.service;

import com.aiatelye.leather.Securty.Configuration.PasswordConfiguration;
import com.aiatelye.leather.Securty.Filter.JwtTokenVeriflerFilter;
import com.aiatelye.leather.Securty.model.Enums.UserRole;
import com.aiatelye.leather.Securty.repository.AuthUserRepository;
import com.aiatelye.leather.componet.JwtTokenUtil;
import com.aiatelye.leather.dao.User;
import com.aiatelye.leather.dao.enums.Enums;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Collections;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class AuthenticaionUserService implements UserDetailsService {
private final  AuthUserRepository authUserRepository;
private final PasswordConfiguration passwordConfiguration;
private final JwtTokenUtil jwtTokenUtil;
    // YAML-dan Client ID-ni oxuyuruq
    @Value("${google.client.id}")
    private String googleClientId;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
         User authUserEntity = authUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(String.format("User %s not found with this Fincode",email)));


        return org.springframework.security.core.userdetails.User.builder()
                .username(authUserEntity.getEmail())
                .password(authUserEntity.getPassword())
                .authorities(authUserEntity.getRole().getGrantedAuthorities().stream().toList())
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }

    public String verifyGoogleAndGenerateJwt(String googleToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    // BURA ÖZ GOOGLE CLIENT ID-ni YAZACAQSAN
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(googleToken);
            if (idToken == null) {
                throw new RuntimeException("Geçərsiz Google Tokeni!");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String googleId = payload.getSubject();

            // İstifadəçini DB-də axtar
            User user = authUserRepository.findByEmail(email).orElseGet(() -> {
                // Yoxdursa, YENİ İSTİFADƏÇİ YARAT (Qeydiyyat)
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name);
                // Şifrə boş ola bilməz deyə 64 simvolluq random şifrə qoyuruq (adam onsuz da bunu bilməyəcək)
                newUser.setPassword(passwordConfiguration.passwordEncoder().encode(UUID.randomUUID().toString()));
                newUser.setRole(UserRole.CUSTOMER); // Default rol
                newUser.setProvider(Enums.AuthProvider.GOOGLE);
                newUser.setOauthId(googleId);
                newUser.setIsActive(true);
                return authUserRepository.save(newUser);
            });

            // Sənin mövcud JWT yaradan metodunu çağırırıq
            return jwtTokenUtil.generateToken(user.getEmail(),user.getRole(),user);

        } catch (Exception e) {
            throw new RuntimeException("Google Login Xətası: " + e.getMessage());
        }
    }
}
