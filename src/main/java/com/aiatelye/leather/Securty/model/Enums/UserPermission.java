package com.aiatelye.leather.Securty.model.Enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum UserPermission {
    // Design
    DESIGN_CREATE("design:create"),
    DESIGN_READ("design:read"),
    DESIGN_DELETE_OWN("design:delete:own"),
    DESIGN_READ_ALL("design:read:all"),
    DESIGN_DELETE_ANY("design:delete:any"),

    // Order
    ORDER_CREATE("order:create"),
    ORDER_READ("order:read"),
    ORDER_CANCEL("order:cancel"),
    ORDER_READ_ALL("order:read:all"),
    ORDER_UPDATE_STATUS("order:update:status"),

    // Product & Catalog
    PRODUCT_MANAGE("product:manage"),
    LEATHER_MANAGE("leather:manage"),
    PRICING_MANAGE("pricing:manage"),
    SHIPPING_MANAGE("shipping:manage"),

    // Analytics & User
    ANALYTICS_VIEW("analytics:view"),
    USER_MANAGE("user:manage"),
    FAVORITE_MANAGE("favorite:manage");

    private final String permission;
}
