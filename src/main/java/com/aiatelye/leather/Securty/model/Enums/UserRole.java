package com.aiatelye.leather.Securty.model.Enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Set;
import java.util.stream.Collectors;

import static com.aiatelye.leather.Securty.model.Enums.UserPermission.*;

@Getter
@AllArgsConstructor
public enum UserRole {
    CUSTOMER(Set.of(
            DESIGN_CREATE,
            DESIGN_READ,
            DESIGN_DELETE_OWN,
            ORDER_CREATE,
            ORDER_READ,
            ORDER_CANCEL,
            FAVORITE_MANAGE
    )),

    ADMIN(Set.of(
            DESIGN_READ_ALL,
            DESIGN_DELETE_ANY,
            ORDER_READ_ALL,
            ORDER_UPDATE_STATUS,
            PRODUCT_MANAGE,
            LEATHER_MANAGE,
            PRICING_MANAGE,
            SHIPPING_MANAGE,
            ANALYTICS_VIEW,
            USER_MANAGE
    ));

    private final Set<UserPermission> permissions;

    public Set<GrantedAuthority> getGrantedAuthorities() {
        Set<GrantedAuthority> authorities = getPermissions().stream()
                .map(p -> new SimpleGrantedAuthority(p.getPermission()))
                .collect(Collectors.toSet());
        authorities.add(new SimpleGrantedAuthority("ROLE_" + name()));
        return authorities;
    }
}
