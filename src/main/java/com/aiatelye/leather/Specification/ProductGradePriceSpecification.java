package com.aiatelye.leather.Specification;

import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dto.admin.price.product.ProductPriceFilter;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

public class ProductGradePriceSpecification {

    public static Specification<ProductGradePrice> withFilter(ProductPriceFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Product ID filter
            if (filter.getProductId() != null) {
                predicates.add(cb.equal(root.get("productModel").get("id"), filter.getProductId()));
            }

            // Grade ID filter
            if (filter.getGradeId() != null) {
                predicates.add(cb.equal(root.get("grade").get("id"), filter.getGradeId()));
            }

            // Currency filter (base currency AZN olduğu üçün price üzərində)
            if (filter.getCurrency() != null) {
                // Əgər spesifik valyuta filter-ləmək istəyirsinizsə
                // Amma ProductGradePrice-də currency field-i var
                predicates.add(cb.equal(root.get("currency"), filter.getCurrency()));
            }

            // Min Price filter
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }

            // Max Price filter
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Boş filter yoxlama
    public static boolean isEmptyFilter(ProductPriceFilter filter) {
        return filter.getProductId() == null &&
                filter.getGradeId() == null &&
                filter.getCurrency() == null &&
                filter.getMinPrice() == null &&
                filter.getMaxPrice() == null;
    }
}