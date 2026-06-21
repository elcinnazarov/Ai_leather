package com.aiatelye.leather.Securty.service;

import com.aiatelye.leather.Securty.Configuration.PasswordConfiguration;
import com.aiatelye.leather.Securty.repository.AuthUserRepository;
import com.aiatelye.leather.dao.PasswordResetToken;
import com.aiatelye.leather.dao.User;
import com.aiatelye.leather.dto.Securty.ForgotPasswordRequest;
import com.aiatelye.leather.dto.Securty.ResetPasswordRequest;
import com.aiatelye.leather.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final AuthUserRepository authUserRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordConfiguration passwordConfiguration;
    private final EmailService emailService;
    @Transactional
    public ResponseEntity<?> forgotPassword(ForgotPasswordRequest request) {
        try {
            User user = authUserRepository.findByEmail(request.getEmail()).orElse(null);

            // Təhlükəsizlik: Email qeydiyyatdan keçməyibsə belə eyni mesaj qaytarılır
            if (user == null) {
                log.warn("Şifrə sıfırlama tələbi mövcud olmayan email üçün: {}", request.getEmail());
                return ResponseEntity.ok()
                        .header("Content-Type", "application/json")
                        .body("{\"message\":\"Əgər email qeydiyyatdan keçibsə, şifrə sıfırlama linki göndərildi\"}");
            }

            // Köhnə aktiv tokenləri ləğv et
            List<PasswordResetToken> oldTokens = tokenRepository.findByUserAndUsedFalse(user);
            oldTokens.forEach(t -> t.setUsed(true));
            tokenRepository.saveAll(oldTokens);

            // Yeni token yarat (15 dəqiqəlik)
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(token);
            resetToken.setUser(user);
            resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
            resetToken.setUsed(false);
            tokenRepository.save(resetToken);

            // TODO: Burada GmailClient ilə email göndərilməlidir
            emailService.sendPasswordResetEmail(user.getEmail(), token);
            log.info("Şifrə sıfırlama tokeni yaradıldı | Email: {} | Token: {}", user.getEmail(), token);

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body("{\"message\":\"Şifrə sıfırlama təlimatları email ünvanına göndərildi\",\"devToken\":\"" + token + "\"}");

        } catch (Exception e) {
            log.error("Şifrə sıfırlama xətası: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Transactional
    public ResponseEntity<?> resetPassword(ResetPasswordRequest request) {
        try {
            PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                    .orElse(null);

            if (resetToken == null || resetToken.isUsed() || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("{\"error\":\"Token etibarsızdır və ya vaxtı keçib\"}");
            }

            // Birbaşa token-dən user obyektini alırıq
            User user = resetToken.getUser();

            // Yeni şifrəni saxla
            user.setPassword(passwordConfiguration.passwordEncoder().encode(request.getNewPassword()));
            authUserRepository.save(user);

            // Token-i istifadə edilmiş kimi qeyd et
            resetToken.setUsed(true);
            tokenRepository.save(resetToken);

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body("{\"message\":\"Şifrə uğurla yeniləndi\"}");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
