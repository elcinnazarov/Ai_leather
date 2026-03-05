package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dto.admin.price.manuel.ManualPriceResponse;
import com.aiatelye.leather.enums.Enums;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface ManualPriceMapper {

    @Mapping(target = "id", source = "entity.id")
    @Mapping(target = "productModelId", source = "entity.productModel.id")
    @Mapping(target = "productModelName", source = "entity.productModel.modelname")
    @Mapping(target = "gradeId", source = "entity.grade.id")
    @Mapping(target = "gradeType", expression = "java(entity.getGrade().getGradename().name())")
    @Mapping(target = "currency", source = "currency")
    @Mapping(target = "manualPrice", source = "manualPrice")
    @Mapping(target = "autoCalculated", source = "autoCalculated")
    @Mapping(target = "isOverridden", expression = "java(manualPrice != null)")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ManualPriceResponse toResponse(ProductGradePrice entity, Enums.Currency currency,
                                   BigDecimal manualPrice, BigDecimal autoCalculated);

}
