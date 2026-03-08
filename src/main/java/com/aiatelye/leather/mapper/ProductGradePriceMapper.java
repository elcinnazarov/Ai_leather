package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.LeatherGrade;
import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.admin.price.product.CreateProductPriceRequest;
import com.aiatelye.leather.dto.admin.price.product.ProductPriceResponse;
import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductGradePriceMapper {
    // 1. Entity yaratma metodu (olduğu kimi qalır)

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

    // 2. Birinci Response metodu (Buna ad qoyuruq)
    @Named("useSpecificResponse")
    @Mapping(target = "productModelId", source = "productModel.id")
    @Mapping(target = "productModelName", source = "productModel.modelname")
    @Mapping(target = "gradeId", source = "grade.id")
    @Mapping(target = "gradeType", source = "grade.gradeType")
    @Mapping(target = "priceAzn", source = "price")
    ProductPriceResponse toResponse(ProductGradePrice entity);

    // 3. İkinci Response metodu (Ad qoymuruq, sadəcə qalır)
    @Mapping(target = "productModelId", source = "entity.productModel.id")
    @Mapping(target = "productModelName", source = "entity.productModel.modelname")
    @Mapping(target = "gradeId", source = "entity.grade.id")
    @Mapping(target = "gradeType", source = "entity.grade.gradeType")
    @Mapping(target = "priceAzn", source = "price")
    ProductPriceResponse toProductPriceResponse(ProductGradePrice entity);

    // 4. Siyahı metodu (Yuxarıdakı "useSpecificResponse" etiketli metodu çağırır)
    @IterableMapping(qualifiedByName = "useSpecificResponse")
    List<ProductPriceResponse> toResponseList(List<ProductGradePrice> entities);

}
