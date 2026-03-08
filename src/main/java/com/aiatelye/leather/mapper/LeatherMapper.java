package com.aiatelye.leather.mapper;


import com.aiatelye.leather.dao.*;
import com.aiatelye.leather.dto.admin.leather.CreatLeatherRequest;
import com.aiatelye.leather.dto.admin.leather.LeatherResponse;
import com.aiatelye.leather.dto.admin.leather.UpdateLeatherRequest;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface LeatherMapper {

    @Mapping(source = "leatherName", target = "leathername")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "grade", ignore = true)
    // Bura diqqət! Xətanı aradan qaldıran hissə:
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "color", ignore = true)
    @Mapping(target = "availabilityStatus", ignore = true)
    Leather toLeatherEntity(CreatLeatherRequest request);

    @Mapping(source = "leathername", target = "leatherName")
    @Mapping(source = "imageUrl", target = "textureImageUrl")
    @Mapping(source = "grade.gradeType", target = "gradeType")
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
     @Mapping(target = "imageUrl", ignore = true)
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
