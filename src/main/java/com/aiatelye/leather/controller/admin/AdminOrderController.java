package com.aiatelye.leather.controller.admin;

import com.aiatelye.leather.dto.admin.order.*;
import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.service.Order.AdminOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Slf4j

public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminOrderListResponse>>> getOrders(
            @Valid OrderFilter filter,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("GET /api/admin/orders - filter: {}, page: {}", filter, pageable);

        PageResponse<AdminOrderListResponse> response = adminOrderService.getOrders(filter, pageable);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminOrderDetailResponse>> getOrderDetail(
            @PathVariable Long id) {

        log.info("GET /api/admin/orders/{} - Admin sifariş detalı sorğulayır", id);

        AdminOrderDetailResponse response = adminOrderService.getOrderDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderStatusUpdateResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        log.info("to enter PUT /api/admin/orders/{}/status - {} -> ", id, request.getNewStatus());

        OrderStatusUpdateResponse response = adminOrderService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
