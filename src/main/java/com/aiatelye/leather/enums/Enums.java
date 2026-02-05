package com.aiatelye.leather.enums;

public class Enums {
    public enum UserRole { ADMIN, CUSTOMER }
    public enum GradeType { STANDARD, PREMIUM, EXOTIC }
    public enum OrderStatus { PENDING, PAID, MANUFACTURING, SHIPPED, COMPLETED, CANCELLED }
    public enum PaymentStatus { WAITING, SUCCESS, FAILED }
    public enum AuthProvider { LOCAL, GOOGLE }
    public enum Currency { AZN, USD, EUR }
    public enum NotificationType { ORDER_CONFIRMATION, ORDER_SHIPPED, PAYMENT_FAILED, ADMIN_NEW_ORDER }// musteriye melumat gondermek ucun
    public enum DesignProcessStatus { GENERATING, SUCCESS, FAILED }
    public  enum  ModelType{ WALLET, BAG, BELT }
    public enum OrderType {READY_PRODUCT, AI_CUSTOM_DESIGN }
    public enum FavoriteTargetType {PRODUCT_MODEL, AI_DESIGN}
    public enum MinioFolderType {PRODUCT, LEATHER, AI}

    public enum AvailabilityStatus {
        ACTIVE, DRAFT, ARCHIVED, OUT_OF_STOCK;

        public boolean canTransitionTo(AvailabilityStatus next) {
            if (this == next) return false;
            return switch (this) {
                case DRAFT -> next == ACTIVE || next == ARCHIVED;
                case ACTIVE -> next == OUT_OF_STOCK || next == ARCHIVED;
                case OUT_OF_STOCK -> next == ACTIVE || next == ARCHIVED;
                case ARCHIVED -> next == DRAFT || next == ACTIVE;
            };
        }

        public Boolean getAssociatedIsActive() {
            return switch (this) {
                case ACTIVE, OUT_OF_STOCK -> true;
                case ARCHIVED -> false;
                case DRAFT -> null; // Mövcud vəziyyəti qoru
            };
        }

}
}
