package com.aiatelye.leather.controller;

import com.aiatelye.leather.componet.CurrentContext;
import com.aiatelye.leather.dto.admin.order.OrderDetailResponse;
import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.dto.order.CreateOrderRequest;
import com.aiatelye.leather.dto.order.OrderResponse;
import com.aiatelye.leather.dto.order.OrderSummaryResponse;
import com.aiatelye.leather.service.Order.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final CurrentContext currentContext;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {

        Long userId = currentContext.getCurrentUserId();
        log.info("POST /api/orders - User: {}, Items: {}", userId, request.getItems().size());

        OrderResponse response = orderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PageResponse<OrderSummaryResponse>>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        int userId = currentContext.getCurrentUserId();
        log.info("GET /api/orders/me - User: {}, page: {}", userId, page);

        PageResponse<OrderSummaryResponse> response = orderService.getMyOrders(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")

    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderById(@PathVariable Long id) {
        int userId = currentContext.getCurrentUserId();
        log.info("GET /api/orders/{} - User: {}", id, userId);

        OrderDetailResponse response = orderService.getOrderById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
