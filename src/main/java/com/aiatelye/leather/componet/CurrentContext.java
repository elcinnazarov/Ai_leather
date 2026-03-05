package com.aiatelye.leather.componet;

import org.springframework.stereotype.Component;

@Component
public class CurrentContext {
    public Long getCurrentUserId() {

    return null;
       /* Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }

        // Burada adətən UserPrincipal və ya CustomUserDetails-dən ID oxunur
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }*/
    }
}