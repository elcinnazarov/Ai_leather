package com.aiatelye.leather.mapper;


import com.aiatelye.leather.dao.ProductImage;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.product.CreateProductModelRequest;
import com.aiatelye.leather.dto.product.ProductImageResponse;
import com.aiatelye.leather.dto.product.ProductModelResponse;
import com.aiatelye.leather.dto.product.UpdateProductModelRequest;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProductModelMapper {


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProductModel toProductModelEntity(CreateProductModelRequest request);

    @Mapping(target = "primaryImageUrl",
            expression = "java(getPrimaryImageUrl(entity))")
    ProductModelResponse toProductModelResponse(ProductModel entity);


    ProductImageResponse toProductImageResponse(ProductImage image);

    default String getPrimaryImageUrl(ProductModel entity) {
        return entity.getImages().stream()
                .filter(ProductImage::getIsPrimary)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(null);
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt",ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateProductModelEntity(UpdateProductModelRequest request, @MappingTarget ProductModel entity);


}
