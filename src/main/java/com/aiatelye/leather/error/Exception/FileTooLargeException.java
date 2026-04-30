package com.aiatelye.leather.error.Exception;

import lombok.Getter;

@Getter
public class FileTooLargeException extends RuntimeException {
    private final String messageKey;
    private final Object[] args; // {0} dinamik parametri (həcm) üçün

    public FileTooLargeException(String messageKey, Object sizeInMb) {
        super("Technical: Uploaded file exceeds maximum allowed size. Actual size: " + sizeInMb + "MB"); // 🛠️ Terminal loqu
        this.messageKey = messageKey;                                            // 🌍 Frontend açarı
        this.args = new Object[]{sizeInMb};                                      // Dinamik parametr {0}
    }
}
