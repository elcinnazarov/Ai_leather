package com.aiatelye.leather.Securty.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // ✅ application.yml-dən oxunur (Serverdə domen adı, lokalda localhost:3000)
    @Value("${spring.app.frontend-url}")
    private String frontendUrl;

    // ✅ application.yml-dəki spring.mail.username avtomatik bura oturur
    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);

            // ✅ İngilis dilində mövzu
            message.setSubject("Ai_Atelye - Reset Your Password");

            // ✅ Dinamik link (Serverdə: https://aiatelye.com/reset-password?token=...)
            String resetLink = frontendUrl + "/reset-password?token=" + token;

            // ✅ İngilis dilində peşəkar məktub mətni
            message.setText("Hello,\n\n"
                    + "We received a request to reset the password for your Ai_Atelye account.\n\n"
                    + "Please click the link below to set a new password:\n"
                    + resetLink + "\n\n"
                    + "This link is valid for 15 minutes.\n"
                    + "If you did not request a password reset, please ignore this email and your password will remain unchanged.\n\n"
                    + "Best regards,\n"
                    + "Ai_Atelye Team");

            mailSender.send(message);
            log.info("Password reset email successfully sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }
}
