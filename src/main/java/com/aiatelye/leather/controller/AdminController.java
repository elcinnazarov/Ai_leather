package com.aiatelye.leather.controller;


import com.aiatelye.leather.dto.ApiResponse;
import com.aiatelye.leather.dto.CreateProductModelRequest;
import com.aiatelye.leather.dto.ProductModelResponse;
import com.aiatelye.leather.dto.UpdateProductModelRequest;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.service.admin.AdminServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminServiceImpl adminService;

    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductModelResponse>>createProductModel(
            @RequestPart("data") @Valid CreateProductModelRequest request,
            @RequestPart("image") List <MultipartFile> image
    ) {
        log.info("POST /api/admin/products - Model: {}", request.getModelName());

        ProductModelResponse response = adminService.createProductModel(request, image);

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        }


        @PostMapping(value = "/products/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<ProductModelResponse>>addProductImages(
                @PathVariable Long id,
                @RequestPart("images") List<MultipartFile> images
        ) {
            ProductModelResponse response = adminService.addProductImages(id, images);
            return ResponseEntity.ok(ApiResponse.success(response));
        }

    @DeleteMapping("/products/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long imageId) {
        adminService.deleteProductImage(imageId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }


    @PatchMapping("/products/{productId}/images/{imageId}/primary")
    public ResponseEntity<ApiResponse<Void>> changePrimaryImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {

        adminService.changePrimaryImage(productId, imageId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<ProductModelResponse>> updateProductModel(
            @PathVariable Long productId,
            @RequestBody @Valid UpdateProductModelRequest request) {

        ProductModelResponse response = adminService.updateProductModel(productId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteProductModel(@PathVariable Long productId) {
        adminService.deleteProductModel(productId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }


    @PutMapping("/products/{productId}/status")
    public ResponseEntity<ApiResponse<ProductModelResponse>> updateProductModelStatus(
            @PathVariable Long productId,
            @RequestParam Enums.AvailabilityStatus status) {

        ProductModelResponse response = adminService.updateProductModelStatus(productId, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

