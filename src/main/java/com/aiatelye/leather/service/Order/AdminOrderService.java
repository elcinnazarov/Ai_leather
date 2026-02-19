package com.aiatelye.leather.service.Order;

import com.aiatelye.leather.Specification.OrderSpecification;
import com.aiatelye.leather.dao.Order;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.dto.order.*;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.error.Exception.InvalidOrderStatusTransitionException;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.error.Exception.OrderSpesificationException;
import com.aiatelye.leather.mapper.AdminOrderMapper;
import com.aiatelye.leather.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final AdminOrderMapper adminOrderMapper;

    @Transactional(readOnly = true)
    public PageResponse<AdminOrderListResponse> getOrders(OrderFilter filter, Pageable pageable) {
        log.info("Admin fetching orders with filter: {}, pagination: {}", filter, pageable);


        Page<Order> orderPage;
        try {
            orderPage = orderRepository.findAll(new OrderSpecification(filter), pageable);
        } catch (Exception e) {

            throw new OrderSpesificationException("Could not retrieve order data"); // Custom exception
        }


        List<AdminOrderListResponse> content = orderPage.getContent().stream()
                .map(adminOrderMapper::toListResponse)
                .collect(Collectors.toList());

        return PageResponse.<AdminOrderListResponse>builder()
                .content(content)
                .pageNumber(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }


    @Transactional(readOnly = true)
    public AdminOrderDetailResponse getOrderDetail(Long orderId) {
        log.info("Admin fetching order detail: {}", orderId);

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));

        return adminOrderMapper.toDetailResponse(order);
    }


    @Transactional
    public OrderStatusUpdateResponse updateStatus(Long orderId, UpdateOrderStatusRequest request) {
        log.info("Admin updating order {} status from to {}", orderId, request.getNewStatus());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));

        Enums.OrderStatus currentStatus = order.getStatus();
        Enums.OrderStatus newStatus = request.getNewStatus();

        // Status keçid qaydalarını yoxla
        if (!currentStatus.canTransitionTo(newStatus)) {
            log.warn("Invalid status transition: {} -> {}", currentStatus, newStatus);
            throw new InvalidOrderStatusTransitionException(String.format("Invalid status transition from %s to %s", currentStatus, newStatus));
        }

        // Statusu yenilə
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        // Xüsusi tarixləri yenilə
        LocalDateTime paidAt = order.getPaidAt();
        LocalDateTime completedAt = order.getCompletedAt();

        if (newStatus == Enums.OrderStatus.PAID && paidAt == null) {
            paidAt = LocalDateTime.now();
            order.setPaidAt(paidAt);
            order.setPaymentStatus(Enums.PaymentStatus.SUCCESS);
        }

        if (newStatus == Enums.OrderStatus.COMPLETED && completedAt == null) {
            completedAt = LocalDateTime.now();
            order.setCompletedAt(completedAt);
        }
        //lazim ola biler !!!
        // Admin qeydi varsa əlavə et ( Order entity-də adminNotes field varsa istifade et. ve ya elave et!!)
        // if (request.getNotes() != null) {
        //     order.setAdminNotes(request.getNotes());
        // }

        Order savedOrder = orderRepository.save(order);

        log.info("Order {} status updated: {} -> {}", orderId, currentStatus, newStatus);

        return OrderStatusUpdateResponse.builder()
                .orderId(savedOrder.getId())
                .orderNumber(savedOrder.getOrderNumber())
                .oldStatus(currentStatus)
                .newStatus(newStatus)
                .message("Status successfully updated to " + newStatus)
                .updatedAt(savedOrder.getUpdatedAt())
                .paidAt(paidAt)
                .completedAt(completedAt)
                .build();
    }


}
