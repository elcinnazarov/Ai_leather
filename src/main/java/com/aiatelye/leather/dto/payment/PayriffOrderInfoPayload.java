package com.aiatelye.leather.dto.payment;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

    /**
     * PayRiff GET /api/v3/orders/:ORDER_ID cavabının tam "payload" strukturu.
     */
    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public class PayriffOrderInfoPayload {

        private String orderId;
        private BigDecimal amount;
        private String currencyType;
        private String merchantName;
        private String operationType;
        private String paymentStatus;      // "PAID", "DECLINED", "CANCELED" və s.
        private Boolean auto;
        private String createdDate;
        private String description;

        // ✅ Tranzaksiyaların tam siyahısı
        private List<TransactionDto> transactions;

        // =========================================================================
        // DAXİLİ STRUKTURLAR (Nested DTO-lar)
        // =========================================================================

        @Getter
        @Setter
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class TransactionDto {
            private String uuid;
            private String createdDate;
            private String status;         // "PAID", "DECLINED"
            private String channel;        // "ACQUIRING_BANK"
            private String channelType;    // "ON_US"
            private String requestRrn;     // Bank RRN kodu
            private String responseRrn;
            private String pan;            // "411111******1111"
            private String paymentWay;     // "DIRECT"
            private CardDetailsDto cardDetails;
            private String merchantCategory;
            private InstallmentDto installment;
        }

        @Getter
        @Setter
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class CardDetailsDto {
            private String maskedPan;      // "411111******1111"
            private String brand;          // "VISA", "MASTERCARD"
            private String cardHolderName; // "JOHN DOE"
        }

        @Getter
        @Setter
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class InstallmentDto {
            private String type;           // "NONE"
            private Integer period;        // Taksit ayı (əgər varsa)
        }
    }

