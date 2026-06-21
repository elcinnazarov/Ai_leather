package com.aiatelye.leather.Specification;

import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.dto.admin.leather.LeatherFilter;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import org.springframework.util.ObjectUtils;

import java.util.ArrayList;
import java.util.List;


public class AdminLeatherSpecification {
    /**
     * ADMIN: Bütün leather-lər (statusdan asılı olmayaraq)
     * isActive=false və ya availabilityStatus=DRAFT olanlar da görünür
     */
    public static Specification<Leather> withAdminFilter(LeatherFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ID
            if (!ObjectUtils.isEmpty(filter.getId())) {
                predicates.add(cb.equal(root.get("id"), filter.getId()));
            }

            // leathername (LIKE, case-insensitive)
            if (!ObjectUtils.isEmpty(filter.getLeathername())) {
                predicates.add(cb.like(
                        cb.lower(root.get("leathername")),
                        "%" + filter.getLeathername().toLowerCase() + "%"
                ));
            }

            // origin (LIKE, case-insensitive)
            if (!ObjectUtils.isEmpty(filter.getOrigin())) {
                predicates.add(cb.like(
                        cb.lower(root.get("origin")),
                        "%" + filter.getOrigin().toLowerCase() + "%"
                ));
            }

            // color (exact match, case-insensitive)
            if (!ObjectUtils.isEmpty(filter.getColor())) {
                predicates.add(cb.equal(
                        cb.lower(root.get("color")),
                        filter.getColor().toLowerCase()
                ));
            }

            // gradeType (grade.gradename)
            if (!ObjectUtils.isEmpty(filter.getGradeType())) {
                predicates.add(cb.equal(
                        root.get("grade").get("gradename"),
                        filter.getGradeType()
                ));
            }

            // availabilityStatus
            if (!ObjectUtils.isEmpty(filter.getAvailabilityStatus())) {
                predicates.add(cb.equal(
                        root.get("availabilityStatus"),
                        filter.getAvailabilityStatus()
                ));
            }

            // isActive (Boolean)
            if (!ObjectUtils.isEmpty(filter.getIsActive())) {
                predicates.add(cb.equal(
                        root.get("isActive"),
                        filter.getIsActive()
                ));
            }

            // Date range (createdAt from BaseEntity)
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
     * CATALOG (Shop): Yalnız ACTIVE + isActive=true
     */
    public static Specification<Leather> withCatalogFilter(LeatherFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // HƏMİŞƏ ACTIVE filter (məcburi)
            predicates.add(cb.equal(root.get("isActive"), true));
            predicates.add(cb.equal(
                    root.get("availabilityStatus"),
                    Enums.AvailabilityStatus.ACTIVE
            ));

            // leathername
            if (!ObjectUtils.isEmpty(filter.getLeathername())) {
                predicates.add(cb.like(
                        cb.lower(root.get("leathername")),
                        "%" + filter.getLeathername().toLowerCase() + "%"
                ));
            }

            // origin
            if (!ObjectUtils.isEmpty(filter.getOrigin())) {
                predicates.add(cb.like(
                        cb.lower(root.get("origin")),
                        "%" + filter.getOrigin().toLowerCase() + "%"
                ));
            }

            // color
            if (!ObjectUtils.isEmpty(filter.getColor())) {
                predicates.add(cb.equal(
                        cb.lower(root.get("color")),
                        filter.getColor().toLowerCase()
                ));
            }

            // gradeType
            if (!ObjectUtils.isEmpty(filter.getGradeType())) {
                predicates.add(cb.equal(
                        root.get("grade").get("gradename"),
                        filter.getGradeType()
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static boolean isEmptyFilter(LeatherFilter filter) {
        return filter.getId() == null &&
                ObjectUtils.isEmpty(filter.getLeathername()) &&
                ObjectUtils.isEmpty(filter.getOrigin()) &&
                ObjectUtils.isEmpty(filter.getColor()) &&
                filter.getGradeType() == null &&
                filter.getAvailabilityStatus() == null &&
                filter.getIsActive() == null &&
                filter.getFrom() == null &&
                filter.getTo() == null;
    }
}
