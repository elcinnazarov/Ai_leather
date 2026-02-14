package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.Order;
import com.aiatelye.leather.dao.OrderItem;
import com.aiatelye.leather.dao.Payment;
import com.aiatelye.leather.dao.User;
import com.aiatelye.leather.dto.AdminOrderDetailResponse;
import com.aiatelye.leather.dto.AdminOrderListResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AdminOrderMapper {


    @Mapping(target = "customerName", source = "user.name")
    @Mapping(target = "customerEmail", source = "user.email")
    @Mapping(target = "itemCount", expression = "java(order.getOrderItems().size())")
    AdminOrderListResponse toListResponse(Order order);


    @Mapping(target = "customer", source = "user")
    @Mapping(target = "items", source = "orderItems")
    @Mapping(target = "payment", source = "payment")
    AdminOrderDetailResponse toDetailResponse(Order order);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "phone", source = "whatsappNumber")
    AdminOrderDetailResponse.CustomerInfo toCustomerInfo(User user);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "productModelId", source = "productModelId")
    @Mapping(target = "productModelName", source = "productModelName")
    @Mapping(target = "leatherId", source = "leatherId")
    @Mapping(target = "leatherName", source = "leatherName")
    @Mapping(target = "renderImageUrl", source = "renderImageUrl")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "unitPrice", source = "unitPrice")
    @Mapping(target = "totalPrice", source = "totalPrice")
    @Mapping(target = "createdAt", source = "createdAt")
    AdminOrderDetailResponse.OrderItemDetail toOrderItemDetail(OrderItem item);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "provider", source = "provider")
    @Mapping(target = "amount", source = "amount")
    @Mapping(target = "currency", source = "currency")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "confirmedAt", source = "confirmedAt")
    AdminOrderDetailResponse.PaymentDetail toPaymentDetail(Payment payment);

    List<AdminOrderDetailResponse.OrderItemDetail> toOrderItemDetailList(List<OrderItem> items);
}
