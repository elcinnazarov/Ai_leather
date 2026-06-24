package com.aiatelye.leather.Securty.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String token) {

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("senin.mailin@gmail.com"); // Buraya öz mailini yaz
            message.setTo(toEmail);
            message.setSubject("Ai_Atelye - Şifrə Sıfırlama");

            // Frontend-in URL-ni bura qoyursan
            String resetLink = "http://localhost:3000/reset-password?token=" + token;

            message.setText("To reset your password, please click the link below:\n\n"
                    + resetLink + "\n\nThis link is valid for 15 minutes.");

            mailSender.send(message);
            log.info("Email uğurla göndərildi: {}", toEmail);
        } catch (Exception e) {
            log.error("Email göndərilərkən xəta baş verdi: {}", e.getMessage());
        }
    }
}
