package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.Order;
import com.aiatelye.leather.dao.OrderItem;
import com.aiatelye.leather.dto.admin.order.OrderDetailResponse;
import com.aiatelye.leather.dto.order.OrderResponse;
import com.aiatelye.leather.dto.order.OrderSummaryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "orderId", source = "id")
    @Mapping(target = "items", expression = "java(mapOrderItems(order.getOrderItems()))")
    OrderResponse toResponse(Order order);

    default List<OrderResponse.OrderItemResponse> mapOrderItems(List<OrderItem> items) {
        if (items == null) return null;
        return items.stream()
                .map(this::toItemResponse)
                .toList();
    }

    default OrderResponse.OrderItemResponse toItemResponse(OrderItem item) {
        return OrderResponse.OrderItemResponse.builder()
                .orderItemId(item.getId())
                .productModelId(item.getProductModelId())
                .productModelName(item.getProductModelName())
                .leatherId(item.getLeatherId())
                .leatherName(item.getLeatherName())
                .renderImageUrl(item.getRenderImageUrl())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }


    //@GetMapping("/me")
    @Mapping(target = "orderId", source = "id")
    @Mapping(target = "itemCount", expression = "java(order.getOrderItems().size())")
    @Mapping(target = "firstProductName", expression = "java(getFirstProductName(order))")
    OrderSummaryResponse toSummaryResponse(Order order);

    default String getFirstProductName(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return null;
        }
        return order.getOrderItems().get(0).getProductModelName();
    }

   //getMapping{id}
    @Mapping(target = "orderId", source = "id")
    @Mapping(target = "customerEmail", source = "user.email")
    @Mapping(target = "items", expression = "java(mapOrderItems(order.getOrderItems()))")
    @Mapping(target = "paymentStatus", source = "payment.status")
    OrderDetailResponse toDetailResponse(Order order);

}
