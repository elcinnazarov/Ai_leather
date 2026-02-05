package com.aiatelye.leather.controller;

import com.aiatelye.leather.dto.*;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.service.admin.AdminServiceImpl;
import com.aiatelye.leather.service.catalog.LeatherServiceImpl;
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
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminServiceImpl adminService;
    private  final LeatherServiceImpl leatherService;

    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResponseProductModel>>createProductModel(
            @RequestPart("data") @Valid RequestCreateProductModel request,
            @RequestPart("image") List <MultipartFile> image
    ) {
        log.info("POST /api/admin/products - Model: {}", request.getModelName());

        ResponseProductModel response = adminService.createProductModel(request, image);

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        }

    @PutMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<ResponseProductModel>> updateProductModel(
            @PathVariable Long productId,
            @RequestBody @Valid UpdateProductModelRequest request) {

        ResponseProductModel response = adminService.updateProductModel(productId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteProductModel(@PathVariable Long productId) {
        adminService.deleteProductModel(productId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }


    @PutMapping("/products/{productId}/status")
    public ResponseEntity<ApiResponse<ResponseProductModel>> updateProductModelStatus(
            @PathVariable Long productId,
            @RequestParam Enums.AvailabilityStatus status) {

        ResponseProductModel response = adminService.updateProductModelStatus(productId, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


//codes about images

    @PostMapping(value = "/products/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResponseProductModel>>addProductImages(
            @PathVariable Long id,
            @RequestPart("images") List<MultipartFile> images
    ) {
        ResponseProductModel response = adminService.addProductImages(id, images);
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

//leaher coding
    @PostMapping(
            value = "/leathers",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<ResponseLeather>> createProductModel(
            @RequestPart("data") @Valid RequestCreatLeather request,
            @RequestPart("image") MultipartFile image
    ) {
        log.info("POST /api/admin/leathers - Create leather request: {}", request.getLeatherName());

         ResponseLeather response= leatherService.createLeather(request, image);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }


    @DeleteMapping("/leathers/{leatherId}/image")
    public ResponseEntity<ApiResponse<Void>> deleteLeatherImage(@PathVariable Long leatherId) {

        log.info("DELETE /api/admin/leathers/{}/image - Delete leather image", leatherId);
        leatherService.deleteLeatherImage(leatherId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }


    @PutMapping(value = "/leathers/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResponseLeather>> updateLeatherImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image) {

        log.info("PUT /api/admin/leathers/{}/image - Update leather image", id);

        ResponseLeather response = leatherService.updateLeatherImage(id, image);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/leathers/{leatherId}")
    public ResponseEntity<ApiResponse<ResponseLeather>> updateLeather(
            @PathVariable Long leatherId,
            @RequestBody @Valid  UpdateLeatherRequest updateLeatherRequest) {

        log.info("PUT /api/admin/leathers/{} - Update leather", leatherId);
        ResponseLeather response = leatherService.updateLeather(leatherId, updateLeatherRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @PutMapping("/leathers/{leatherId}/status")
    public ResponseEntity<ApiResponse<ResponseLeather>> updateLeatherStatus(
            @PathVariable Long leatherId,
            @RequestParam Enums.AvailabilityStatus status){

     ResponseLeather response = leatherService.updateLeatherStatus(leatherId, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/leathers/{leathersId}")
    public ResponseEntity<ApiResponse<Void>> deleteLeather(@PathVariable Long leathersId) {
        leatherService.deleteleather(leathersId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }


}

