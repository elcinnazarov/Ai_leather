package com.aiatelye.leather.controller.catalog;

import com.aiatelye.leather.dto.catalog.product.*;
import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.service.catalog.ProductCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductCatalogService productCatalogService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProductCatalogResponse>> getProducts(
            @Valid @ModelAttribute ProductFilterRequest filter) {
        log.info("GET /api/products - page: {}, filter: {}", filter.getPage(), filter);
        ProductCatalogResponse response = productCatalogService.getProductsSlice(filter);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductDetail(
            @PathVariable Long id) {
        log.info("GET /api/products/{} - Product detail requested", id);
        ProductDetailResponse response = productCatalogService.getProductDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @GetMapping("/{id}/prices")
    public ResponseEntity<ApiResponse<ProductPriceMatrixResponse>> getProductPrices(
            @PathVariable Long id) {
        log.info("GET /api/products/{}/prices - Price matrix requested", id);
        ProductPriceMatrixResponse response = productCatalogService.getProductPriceMatrix(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @GetMapping("/{id}/available-leathers")
    public ResponseEntity<ApiResponse<List<P_AvailableLeatherResponse>>> getAvailableLeathers(
            @PathVariable Long id) {
        log.info("GET /api/products/{}/available-leathers", id);
        List<P_AvailableLeatherResponse> response = productCatalogService.getAvailableLeathers(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
