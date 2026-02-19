package com.aiatelye.leather.Specification;

import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.dto.catalog.LeatherFilterRequest;
import com.aiatelye.leather.enums.Enums;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;

public class LeatherSpecification {
    public static Specification<Leather> withFilter(LeatherFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Həmişə antiviral
            predicates.add(cb.equal(root.get("isActive"), true));
            predicates.add(cb.equal(root.get("availabilityStatus"), Enums.AvailabilityStatus.ACTIVE));

            // Color filter
            if (filter.getColor() != null && !filter.getColor().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("color")),
                        filter.getColor().toLowerCase()));
            }

            // Origin filter
            if (filter.getOrigin() != null && !filter.getOrigin().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("origin")),
                        filter.getOrigin().toLowerCase()));
            }

            // Grade type filter
            if (filter.getGradeType() != null) {
                predicates.add(cb.equal(root.get("grade").get("gradename"),
                        filter.getGradeType()));
            }

            /* Stok filter
            if (filter.getInStock() != null && filter.getInStock()) {
                predicates.add(cb.greaterThan(root.get("stockAmount"), 0));
            }*/

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static boolean isEmptyFilter(LeatherFilterRequest filter) {
        return (filter.getColor() == null || filter.getColor().isBlank()) &&
                (filter.getOrigin() == null || filter.getOrigin().isBlank()) &&
                filter.getGradeType() == null ;
    }
}
