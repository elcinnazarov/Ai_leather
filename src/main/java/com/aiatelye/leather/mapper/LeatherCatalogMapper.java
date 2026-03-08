package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dto.catalog.leather.*;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import com.aiatelye.leather.dao.*;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface LeatherCatalogMapper {



    @Mapping(target = "name", source = "leathername")
    @Mapping(target = "gradeType", source = "grade.gradeType")
    @Mapping(target = "gradeLevel", source = "grade.gradeLevel")
    LeatherListResponse toListResponse(Leather leather);

    List<LeatherListResponse> toListResponseList(List<Leather> leathers);


    @Mapping(target = "name", source = "leathername")
    @Mapping(target = "textureUrl", ignore = true) // Əgər varsa əlavə et
    @Mapping(target = "description", ignore = true) // Entity-də yoxdursa
    @Mapping(target = "grade", source = "grade")
    @Mapping(target = "usedInProducts", expression = "java(mapUsedInProducts(leather.getGrade()))")
    LeatherDetailResponse toDetailResponse(Leather leather);

    default LeatherDetailResponse.GradeInfo mapGrade(LeatherGrade grade) {
        if (grade == null) return null;
        return LeatherDetailResponse.GradeInfo.builder()
                .id(grade.getId())
                .name(grade.getGradeType().name())
                .description(grade.getDescription())
                .build();
    }

    default List<LeatherDetailResponse.ProductSummary> mapUsedInProducts(LeatherGrade grade) {
        if (grade == null || grade.getProductPrices() == null) return null;

        return grade.getProductPrices().stream()
                .map(ProductGradePrice::getProductModel)
                .distinct()
                .map(pm -> LeatherDetailResponse.ProductSummary.builder()
                        .id(pm.getId())
                        .name(pm.getModelname())
                        .modelType(pm.getModelType().name())
                        .primaryImageUrl(getPrimaryImageUrl(pm))
                        .build())
                .collect(Collectors.toList());
    }

    default String getPrimaryImageUrl(ProductModel pm) {
        if (pm.getImages() == null || pm.getImages().isEmpty()) return null;
        return pm.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(pm.getImages().get(0).getImageUrl());
    }


    @Mapping(target = "name", source = "leathername")
    LeatherByGradeResponse toResponse(Leather leather);

    List<LeatherByGradeResponse> toResponseList(List<Leather> leathers);


    @Mapping(target = "gradeType", source = "gradeType")
    @Mapping(target = "leatherCount", ignore = true)
    GradeListResponse toResponse(LeatherGrade grade);


    @Mapping(target = "gradeType", source = "gradeType")
    @Mapping(target = "leathers", expression = "java(mapLeathers(grade))")
    LeatherGradeDetailResponse toDetailResponse(LeatherGrade grade);

    default List<LeatherGradeDetailResponse.LeatherSummary> mapLeathers(LeatherGrade grade) {
        if (grade.getLeathers() == null) return null;

        return grade.getLeathers().stream()
                .filter(l -> l.getIsActive() != null && l.getIsActive())
                .map(this::toLeatherSummary)
                .collect(Collectors.toList());
    }

    default LeatherGradeDetailResponse.LeatherSummary toLeatherSummary(Leather leather) {
        return LeatherGradeDetailResponse.LeatherSummary.builder()
                .id(leather.getId())
                .name(leather.getLeathername())
                .color(leather.getColor())
                .textureUrl(leather.getImageUrl())
                .origin(leather.getOrigin())
                .build();
    }
}
