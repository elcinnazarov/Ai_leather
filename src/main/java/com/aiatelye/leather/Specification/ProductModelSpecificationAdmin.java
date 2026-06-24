package com.aiatelye.leather.Specification;

import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.dto.admin.product.ProductModelFilter;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.ObjectUtils;

import java.util.ArrayList;
import java.util.List;

public class ProductModelSpecificationAdmin {

    /**
     * ADMIN: Bütün product-lar (statusdan asılı olmayaraq)
     * isActive=false, DRAFT, ARCHIVED hamısı görünür
     */
    public static Specification<ProductModel> withAdminFilter(ProductModelFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ID
            if (!ObjectUtils.isEmpty(filter.getId())) {
                predicates.add(cb.equal(root.get("id"), filter.getId()));
            }

            // modelname (LIKE, case-insensitive)
            if (!ObjectUtils.isEmpty(filter.getModelname())) {
                predicates.add(cb.like(
                        cb.lower(root.get("modelname")),
                        "%" + filter.getModelname().toLowerCase() + "%"
                ));
            }

            // modelType (WALLET, BAG, BELT)
            if (!ObjectUtils.isEmpty(filter.getModelType())) {
                predicates.add(cb.equal(root.get("modelType"), filter.getModelType()));
            }

            // availabilityStatus
            if (!ObjectUtils.isEmpty(filter.getAvailabilityStatus())) {
                predicates.add(cb.equal(
                        root.get("availabilityStatus"),
                        filter.getAvailabilityStatus()
                ));
            }

            // isActive
            if (!ObjectUtils.isEmpty(filter.getIsActive())) {
                predicates.add(cb.equal(root.get("isActive"), filter.getIsActive()));
            }

            // Date range
            if (!ObjectUtils.isEmpty(filter.getFrom())) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getFrom().atStartOfDay()
                ));
            }
            if (!ObjectUtils.isEmpty(filter.getTo())) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getTo().atTime(23, 59, 59)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * SHOP (Catalog): Yalnız ACTIVE + isActive=true
     */
    public static Specification<ProductModel> withShopFilter(ProductModelFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // HƏMİŞƏ ACTIVE filter
            predicates.add(cb.equal(root.get("isActive"), true));
            predicates.add(cb.equal(
                    root.get("availabilityStatus"),
                    Enums.AvailabilityStatus.ACTIVE
            ));

            // modelname
            if (!ObjectUtils.isEmpty(filter.getModelname())) {
                predicates.add(cb.like(
                        cb.lower(root.get("modelname")),
                        "%" + filter.getModelname().toLowerCase() + "%"
                ));
            }

            // modelType
            if (!ObjectUtils.isEmpty(filter.getModelType())) {
                predicates.add(cb.equal(root.get("modelType"), filter.getModelType()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static boolean isEmptyFilter(ProductModelFilter filter) {
        return filter.getId() == null &&
                ObjectUtils.isEmpty(filter.getModelname()) &&
                filter.getModelType() == null &&
                filter.getAvailabilityStatus() == null &&
                filter.getIsActive() == null &&
                filter.getFrom() == null &&
                filter.getTo() == null;
    }
}
