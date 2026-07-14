package com.aiatelye.leather.controller.admin;

import com.aiatelye.leather.dto.DeliveryCountry.DeliveryCountryResponse;
import com.aiatelye.leather.dto.DeliveryCountry.ToggleCountryRequest;
import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.service.DeliveryCountry.DeliveryCountryConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ShippingConfigController {
    private final DeliveryCountryConfigService service;

 // user token ile
    @GetMapping("/shipping/public/active-countries")
    public ResponseEntity<ApiResponse<List<DeliveryCountryResponse>>> getActiveCountries() {
        return ResponseEntity.ok(ApiResponse.success(service.getActiveCountries()));
    }

    // ADMIN: Bütün ölkələr
    @GetMapping("/admin/shipping-countries")
    public ResponseEntity<ApiResponse<List<DeliveryCountryResponse>>> getAllCountries() {
        return ResponseEntity.ok(ApiResponse.success(service.getAllCountries()));
    }

    // ADMIN: Toggle aktiv/deaktiv
    @PatchMapping("/admin/shipping-countries/{code}/toggle")
    public ResponseEntity<ApiResponse<DeliveryCountryResponse>> toggleCountry(
            @PathVariable String code,
            @Valid @RequestBody ToggleCountryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        String adminEmail = userDetails != null ? userDetails.getUsername() : "unknown";
        return ResponseEntity.ok(ApiResponse.success(
                service.toggleCountry(code, request, adminEmail)
        ));
    }
}
