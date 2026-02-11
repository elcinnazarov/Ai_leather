package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.LeatherGrade;
import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.CreateProductPriceRequest;
import com.aiatelye.leather.dto.ProductPriceResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductGradePriceMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "price", source = "request.price")
    @Mapping(target = "currency", constant = "AZN")
    @Mapping(target = "manualUsd", ignore = true)
    @Mapping(target = "manualEur", ignore = true)
    @Mapping(target = "productModel", source = "productModel")
    @Mapping(target = "grade", source = "grade")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProductGradePrice toProductGradePriceEntity(CreateProductPriceRequest request, ProductModel productModel, LeatherGrade grade);

    @Mapping(target = "productModelId", source = "entity.productModel.id")
    @Mapping(target = "productModelName", source = "entity.productModel.modelname")
    @Mapping(target = "gradeId", source = "entity.grade.id")
    @Mapping(target = "gradeType", source = "entity.grade.gradename")
    @Mapping(target = "gradeLevel", source = "entity.grade.gradeLevel")
    @Mapping(target = "priceAzn", source = "price")
    ProductPriceResponse toProductPriceResponse(ProductGradePrice entity);

}
