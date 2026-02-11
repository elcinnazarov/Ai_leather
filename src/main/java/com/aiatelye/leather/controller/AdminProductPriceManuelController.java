package com.aiatelye.leather.controller;

import com.aiatelye.leather.dto.*;
import com.aiatelye.leather.service.pricing.ManualPriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@Slf4j
public class AdminProductPriceManuelController {


        private final ManualPriceService manualPriceService;

        @PostMapping("/{productId}/manual-prices")
        public ResponseEntity<ApiResponse<ListManuelPricesResponse>> createManualPrices(
                @PathVariable Long productId,
                @RequestBody @Valid ListCreateManualPricesRequest request) {

            log.info("POST /api/admin/products/{}/manual-prices", productId);

            ListManuelPricesResponse response = manualPriceService.createManualPrices(productId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        }


    @GetMapping("/{productId}/manual-prices")
    public ResponseEntity<ApiResponse<ListManuelPricesResponse>> getManualPrices(
            @PathVariable Long productId) {

        log.info("GET /api/admin/products/{}/manual-prices", productId);

        ListManuelPricesResponse response = manualPriceService.getManualPrices(productId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @PutMapping("/{productId}/manual-prices")
    public ResponseEntity<ApiResponse<ListManuelPricesResponse>> updateManualPrices(
            @PathVariable Long productId,
            @RequestBody @Valid ListCreateManualPricesRequest request) {

        log.info("PUT /api/admin/products/{}/manual-prices", productId);

        ListManuelPricesResponse response = manualPriceService.updateManualPrices(productId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @DeleteMapping("/{productId}/manual-prices")
    public ResponseEntity<ApiResponse<ListManuelPricesResponse>> deleteManualPrices(
            @PathVariable Long productId,
            @RequestBody @Valid ListDeleteManualPricesRequest request) {

        log.info("DELETE /api/admin/products/{}/manual-prices", productId);

        ListManuelPricesResponse response = manualPriceService.deleteManualPrices(productId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    }

