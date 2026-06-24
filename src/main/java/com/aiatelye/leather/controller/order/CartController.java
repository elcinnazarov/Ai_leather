package com.aiatelye.leather.controller.order;

import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.dto.order.CartPreviewRequest;
import com.aiatelye.leather.dto.order.CartPreviewResponse;
import com.aiatelye.leather.service.Order.CartPreviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
public class    CartController{

    private final CartPreviewService cartPreviewService;

    /**
     * Səbəti validate et + qiymət hesabla (checkout öncəsi)
     * Public endpoint - login tələb etmir
     */
    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<CartPreviewResponse>> previewCart(
            @Valid @RequestBody CartPreviewRequest request) {

        log.info("POST /api/cart/preview - {} items, currency: {}",
                request.getItems().size(), request.getCurrency());

        CartPreviewResponse response = cartPreviewService.previewCart(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


}
