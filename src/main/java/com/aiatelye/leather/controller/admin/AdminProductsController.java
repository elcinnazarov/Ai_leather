package com.aiatelye.leather.controller.admin;

import com.aiatelye.leather.dto.admin.product.*;
import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.service.admin.AdminServiceImpl;
import com.aiatelye.leather.service.catalog.AdminProductModelService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/admin/products")
public class AdminProductsController {


    private final AdminProductModelService adminProductModelService;
    private final AdminServiceImpl adminService;
    // ==========================================
    // GET - YENİ (Admin bütün product-ları görür)
    // ==========================================
    @GetMapping
    @Operation(summary = "Get all product models (Admin sees ALL regardless of status)")
    public ResponseEntity<ApiResponse<PageResponse<AdminProductModelResponse>>> getProductModels(
            @Valid ProductModelFilter filter,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("GET /api/admin/products - filter: {}, page: {}", filter, pageable);

        PageResponse<AdminProductModelResponse> response = adminProductModelService.getProductModels(filter, pageable);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==========================================
    // GET BY ID - YENİ
    // ==========================================
    @GetMapping("/{id}")
    @Operation(summary = "Get product model by ID")
    public ResponseEntity<ApiResponse<AdminProductModelResponse>> getProductModelById(@PathVariable Long id) {
        log.info("GET /api/admin/products/{}", id);

        AdminProductModelResponse response = adminProductModelService.getProductModelById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductModelResponse>>createProductModel(
            @RequestPart("data") @Valid CreateProductModelRequest request,
            @RequestPart("image") List <MultipartFile> image
    ) {
        log.info("POST /api/admin/products - Model: {}", request.getModelName());

        ProductModelResponse response = adminService.createProductModel(request, image);

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        }

    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductModelResponse>> updateProductModel(
            @PathVariable Long productId,
            @RequestBody @Valid UpdateProductModelRequest request) {

        ProductModelResponse response = adminService.updateProductModel(productId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteProductModel(@PathVariable Long productId) {
        adminService.deleteProductModel(productId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }


    @PutMapping("/{productId}/status")
    public ResponseEntity<ApiResponse<ProductModelResponse>> updateProductModelStatus(
            @PathVariable Long productId,
            @RequestParam Enums.AvailabilityStatus status) {

        ProductModelResponse response = adminService.updateProductModelStatus(productId, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


//codes of image

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductModelResponse>>addProductImages(
            @PathVariable Long id,
            @RequestPart("images") List<MultipartFile> images
    ) {
        ProductModelResponse response = adminService.addProductImages(id, images);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long imageId) {
        adminService.deleteProductImage(imageId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }


    @PatchMapping("/{productId}/images/{imageId}/primary")
    public ResponseEntity<ApiResponse<Void>> changePrimaryImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {

        adminService.changePrimaryImage(productId, imageId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

}

