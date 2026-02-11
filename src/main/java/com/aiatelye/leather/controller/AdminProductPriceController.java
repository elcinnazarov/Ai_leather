package com.aiatelye.leather.controller;

import com.aiatelye.leather.dto.*;
import com.aiatelye.leather.service.pricing.ProductPriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/admin/products")
public class AdminProductPriceController {

    private final ProductPriceService productPriceService;

    @PostMapping("/{productId}/prices")

    public ResponseEntity<ApiResponse<ListProductPriceResponse>> createProductPrices(
            @PathVariable Long productId,
            @RequestBody @Valid ListCreateProductPricesRequest request) {

        log.info("POST /api/admin/products/{}/prices - Create prices", productId);

        ListProductPriceResponse response = productPriceService.createProductPrices(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{productId}/prices")
    public ResponseEntity<ApiResponse<ListProductPriceResponse>> getProductPrices(
            @PathVariable Long productId) {

        log.info("GET /api/admin/products/{}/prices", productId);

        ListProductPriceResponse response = productPriceService.getProductPrices(productId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{productId}/prices/{gradeId}")
    public ResponseEntity<ApiResponse<ProductPriceResponse>> updateProductPrice(
            @PathVariable Long productId,
            @PathVariable Long gradeId,
            @RequestBody @Valid UpdateProductPriceRequest request) {

        log.info("PUT /api/admin/products/{}/prices/{}", productId, gradeId);

        ProductPriceResponse response = productPriceService.updateProductPrice(productId, gradeId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    @DeleteMapping("/{productId}/prices/{gradeId}")
    public ResponseEntity<ApiResponse<Void>> deleteProductPrice(
            @PathVariable Long productId,
            @PathVariable Long gradeId) {

        log.info("DELETE /api/admin/products/{}/prices/{}", productId, gradeId);

        productPriceService.deleteProductPrice(productId, gradeId);
        return ResponseEntity.ok(ApiResponse.success(null));

    }



}
