package com.aiatelye.leather.enums;

public class Enums {
    public enum UserRole { ADMIN, CUSTOMER }
    public enum GradeType { STANDARD, PREMIUM, EXOTIC }
    public enum OrderStatus { PENDING, PAID, MANUFACTURING, SHIPPED, COMPLETED, CANCELLED }
    public enum PaymentStatus { WAITING, SUCCESS, FAILED }
    public enum AuthProvider { LOCAL, GOOGLE }
    public enum AvailabilityStatus { ACTIVE, DRAFT, ARCHIVED, OUT_OF_STOCK }
    public enum Currency { AZN, USD, EUR }
    public enum NotificationType { ORDER_CONFIRMATION, ORDER_SHIPPED, PAYMENT_FAILED, ADMIN_NEW_ORDER }// musteriye melumat gondermek ucun
    public enum DesignProcessStatus { GENERATING, SUCCESS, FAILED }
    public  enum  ModelType{ WALLET, BAG, BELT }
    public enum OrderType {READY_PRODUCT, AI_CUSTOM_DESIGN }
    public enum FavoriteTargetType {
        PRODUCT_MODEL,
        AI_DESIGN
    }
}
