package com.aiatelye.leather.Specification;

import com.aiatelye.leather.dao.Order;
import com.aiatelye.leather.dto.admin.order.OrderFilter;
import com.aiatelye.leather.dao.enums.Enums;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@RequiredArgsConstructor
public class OrderSpecification implements Specification<Order> {

    private final OrderFilter filter;
    @Override
    public Predicate toPredicate(Root<Order> root,
                                 CriteriaQuery<?> query,
                                 CriteriaBuilder criteriaBuilder) {



        List<Predicate> predicates = new ArrayList<>();

        // ID
        Long id = filter.getId();
        if (!ObjectUtils.isEmpty(id)) {
            predicates.add(criteriaBuilder.equal(root.get("id"), id));
        }

        // Order Number
        String orderNumber = filter.getOrderNumber();
        if (!ObjectUtils.isEmpty(orderNumber)) {
            predicates.add(criteriaBuilder.like(root.get("orderNumber"), "%" + orderNumber + "%"));
        }

        // Status
        Enums.OrderStatus status = filter.getStatus();
        if (!ObjectUtils.isEmpty(status)) {
            predicates.add(criteriaBuilder.equal(root.get("status"), status));
        }

        // Payment Status
        Enums.PaymentStatus paymentStatus = filter.getPaymentStatus();
        if (!ObjectUtils.isEmpty(paymentStatus)) {
            predicates.add(criteriaBuilder.equal(root.get("paymentStatus"), paymentStatus));
        }

        // Customer Email
        String customerEmail = filter.getCustomerEmail();
        if (!ObjectUtils.isEmpty(customerEmail)) {
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("customerEmail")),
                    "%" + customerEmail.toLowerCase() + "%"));
        }

        // Customer Name (User entity ilə əlaqə)
        String customerName = filter.getCustomerName();
        if (!ObjectUtils.isEmpty(customerName)) {
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("name")),
                    "%" + customerName.toLowerCase() + "%"));
        }

        // Date Range
        if (!ObjectUtils.isEmpty(filter.getFrom())) {
            LocalDateTime fromDateTime = filter.getFrom().atStartOfDay();
            predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), fromDateTime));
        }

        if (!ObjectUtils.isEmpty(filter.getTo())) {
            LocalDateTime toDateTime = filter.getTo().atTime(23, 59, 59);
            predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), toDateTime));
        }

        // Amount Range
        if (!ObjectUtils.isEmpty(filter.getMinAmount())) {
            predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("totalAmount"), filter.getMinAmount()));
        }

        if (!ObjectUtils.isEmpty(filter.getMaxAmount())) {
            predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("totalAmount"), filter.getMaxAmount()));
        }

        return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
    }
    }




