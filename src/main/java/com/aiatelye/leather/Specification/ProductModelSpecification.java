package com.aiatelye.leather.Specification;

import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.catalog.product.ProductFilterRequest;
import com.aiatelye.leather.enums.Enums;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;

public class ProductModelSpecification {
    public static Specification<ProductModel> withFilter(ProductFilterRequest filter) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            /// catalogda musterinin goreciyi
            /// bu default sertdir
            predicates.add(cb.equal(root.get("isActive"), true));
            predicates.add(cb.equal(root.get("availabilityStatus"), Enums.AvailabilityStatus.ACTIVE));

            if (filter.getModelType() != null) {
                predicates.add(cb.equal(root.get("modelType"), filter.getModelType()));
            }

            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("modelname")),
                        "%" + filter.getSearch().toLowerCase() + "%"
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static boolean isEmptyFilter(ProductFilterRequest filter) {
        return filter.getModelType() == null &&
                (filter.getSearch() == null || filter.getSearch().isBlank());
    }
}
