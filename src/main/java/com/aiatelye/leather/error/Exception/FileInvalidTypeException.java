package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class FileInvalidTypeException extends RuntimeException {
    private final String messageKey;
    private final Object[] args; // {0}, {1} kimi dinamik parametrlər üçün

    // Sənin Servisdəki throw məntiqinə uyğun konstruktor
    public FileInvalidTypeException(String messageKey, String extension) {
        super("Technical: Uploaded file has invalid extension: " + extension); // 🛠️ Terminal loqu
        this.messageKey = messageKey;                                          // 🌍 Frontend açarı
        this.args = new Object[]{extension};                                   // Dinamik parametr {0}
    }
}
