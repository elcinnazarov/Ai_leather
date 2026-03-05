package com.aiatelye.leather.controller.admin;

import com.aiatelye.leather.dto.admin.shiping.AdminShippingLocationResponse;
import com.aiatelye.leather.dto.admin.shiping.CreateShippingLocationRequest;
import com.aiatelye.leather.dto.admin.shiping.UpdateShippingLocationRequest;
import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.service.Order.AdminShippingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/shipping-locations")
@RequiredArgsConstructor
public class AdminShippingController {

    private final AdminShippingService adminShippingService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminShippingLocationResponse>>> getAllLocations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageResponse<AdminShippingLocationResponse> response =
                adminShippingService.getAllLocations(page, size);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminShippingLocationResponse>> getLocationById(
            @PathVariable Long id) {

        AdminShippingLocationResponse response = adminShippingService.getLocationById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminShippingLocationResponse>> createLocation(
            @Valid @RequestBody CreateShippingLocationRequest request) {

        AdminShippingLocationResponse response = adminShippingService.createLocation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminShippingLocationResponse>> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShippingLocationRequest request) {

        AdminShippingLocationResponse response = adminShippingService.updateLocation(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminShippingLocationResponse>> statusLocation(
            @PathVariable Long id) {

        AdminShippingLocationResponse response = adminShippingService.toggleLocation(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteLocation(@PathVariable Long id) {

        adminShippingService.deleteLocation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Shipping location deleted successfully"));
    }
}
