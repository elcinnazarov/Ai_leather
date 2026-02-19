package com.aiatelye.leather.mapper;


import com.aiatelye.leather.dao.*;
import com.aiatelye.leather.dto.catalog.LeatherByGradeResponse;
import com.aiatelye.leather.dto.catalog.LeatherDetailResponse;
import com.aiatelye.leather.dto.catalog.LeatherListResponse;
import com.aiatelye.leather.dto.leather.CreatLeatherRequest;
import com.aiatelye.leather.dto.leather.LeatherResponse;
import com.aiatelye.leather.dto.leather.UpdateLeatherRequest;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring",
unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface LeatherMapper {

    @Mapping(target = "leatherName", source = "leatherName")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updateAt", ignore = true)
    @Mapping(target = "leatherName", source = "leatherName")
    @Mapping(target = "grade", ignore = true)
    Leather toLeatherEntity(CreatLeatherRequest request);

    @Mapping(source = "leathername", target = "leatherName")
    @Mapping(source = "imageUrl", target = "textureImageUrl")
    @Mapping(source = "grade.gradename", target = "gradeType")
    LeatherResponse toLeatherResponse(Leather entity);

     //Update üçün - PARTIAL (null olanları ignore et)
     @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
     @Mapping(target = "id", ignore = true)
     @Mapping(target = "createdAt", ignore = true)
     @Mapping(target = "updatedAt", ignore = true)
     @Mapping(target = "isActive", ignore = true)        // Başqa endpointdə
     @Mapping(target = "availabilityStatus", ignore = true) // Başqa endpointdə
     @Mapping(target = "grade", ignore = true)           // Manual set edilir
     @Mapping(target = "leathername", source = "leatherName")
     void updateLeatherEntityFromRequest(UpdateLeatherRequest leatherUpdateRequest, @MappingTarget Leather entity);


    /*//Catalog of codes here

    @Mapping(target = "name", source = "leathername")
    @Mapping(target = "gradeType", source = "grade.gradename")
    @Mapping(target = "gradeLevel", source = "grade.gradeLevel")
    LeatherListResponse toListResponse(Leather leather);

    List<LeatherListResponse> toListResponseList(List<Leather> leathers);


    @Mapping(target = "name", source = "leathername")
    @Mapping(target = "additionalImages", ignore = true) // Əgər varsa əlavə et
    @Mapping(target = "description", ignore = true) // Entity-də yoxdursa
    @Mapping(target = "grade", source = "grade")
    @Mapping(target = "usedInProducts", expression = "java(mapUsedInProducts(leather.getGrade()))")
    LeatherDetailResponse toDetailResponse(Leather leather);

    default LeatherDetailResponse.GradeInfo mapGrade(LeatherGrade grade) {
        if (grade == null) return null;
        return LeatherDetailResponse.GradeInfo.builder()
                .id(grade.getId())
                .name(grade.getGradename().name())
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

    List<LeatherByGradeResponse> toResponseList(List<Leather> leathers);*/
}
