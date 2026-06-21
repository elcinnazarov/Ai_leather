package com.aiatelye.leather.dao.enums;


public class Enums {

    public enum GradeType { STANDARD, PREMIUM, EXOTIC }
    public enum PaymentStatus { WAITING, SUCCESS, FAILED }
    public enum AuthProvider { LOCAL, GOOGLE }
    public enum Currency { AZN, USD, EUR }
    public enum NotificationType { ORDER_CONFIRMATION, ORDER_SHIPPED, PAYMENT_FAILED, ADMIN_NEW_ORDER }// musteriye melumat gondermek ucun
    public enum DesignProcessStatus { GENERATING, SUCCESS, FAILED ,COMPLETED}
    public  enum ProductCategory {BAG, BELT, WALLET, ACCESSORY}
    public enum OrderType {READY_PRODUCT, AI_CUSTOM_DESIGN }
    public enum FavoriteTargetType {PRODUCT_MODEL, AI_DESIGN}
    public enum MinioFolderType {PRODUCT, LEATHER, AI}
    public enum Gender {MALE, FEMALE, UNISEX}
    public enum DesignCategory {CLASSIC, MODERN, LUXURY, MINIMALIST, VINTAGE}
    public enum CacheKeyType {
        STANDARD,   // MD5 hash (32 char)
        CUSTOM,     // UUID format
        UNKNOWN     // Tanınmayan
    }

    public enum OrderStatus {
        PENDING, PAID, MANUFACTURING, SHIPPED, COMPLETED, CANCELLED;

        public boolean canTransitionTo(OrderStatus next) {
            return switch (this) {
                case PENDING -> next == PAID || next == CANCELLED;
                case PAID -> next == MANUFACTURING || next == CANCELLED;
                case MANUFACTURING -> next == SHIPPED;
                case SHIPPED -> next == COMPLETED;
                case COMPLETED, CANCELLED -> false; // Terminal vəziyyətlər
            };
        }


    }

    public enum AvailabilityStatus {
        ACTIVE,
        DRAFT,
        ARCHIVED,
        OUT_OF_STOCK;

       public boolean canTransitionTo(AvailabilityStatus next) {
            if (this == next) return false;
            return switch (this) {
                case DRAFT, OUT_OF_STOCK -> next == ACTIVE || next == ARCHIVED;
                case ACTIVE -> next == OUT_OF_STOCK || next == ARCHIVED;
                case ARCHIVED -> next == DRAFT || next == ACTIVE;
            };
        }

        public Boolean getAssociatedIsActive() {
            return switch (this) {
                case ACTIVE, OUT_OF_STOCK -> true;
                case ARCHIVED -> false;
                case DRAFT -> null; // Mövcud vəziyyəti qoru
            };


       /* public boolean canTransitionTo(AvailabilityStatus next) {
            if (this == next) return true; // Eyni vəziyyətə keçid həmişə mümkündür

            return switch (this) {
                case DRAFT -> next == ACTIVE || next == ARCHIVED;
                case ACTIVE -> next == DRAFT || next == OUT_OF_STOCK || next == ARCHIVED;
                case OUT_OF_STOCK -> next == ACTIVE || next == ARCHIVED || next == DRAFT;
                case ARCHIVED -> next == DRAFT; // Arxivdən yalnız redaktəyə qayıda bilsin
            };
        }

        public boolean isActive() {
            return this == ACTIVE || this == OUT_OF_STOCK;
        }*/

        }

    } public enum Country {
        // Yerli
        AZERBAIJAN,

        // Avropa (Keyfiyyət və Sənətkarlıq)
        GERMANY,
        FRANCE,
        ITALY,
        UNITED_KINGDOM,
        SWITZERLAND,

        // Şimali Amerika (Böyük Bazar)
        USA,
        CANADA,

        // Asiya və Okeaniya (Detallara önəm verənlər)
        JAPAN,
        AUSTRALIA,

        // Körfəz ölkələri (Lüks seqment)
        UAE,
        SAUDI_ARABIA,

        // Digər
        INTERNATIONAL_OTHER

    }



}
