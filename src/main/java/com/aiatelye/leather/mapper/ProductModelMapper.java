package com.aiatelye.leather.mapper;


import com.aiatelye.leather.dao.ProductImage;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.RequestCreateProductModel;
import com.aiatelye.leather.dto.ResponseProductImage;
import com.aiatelye.leather.dto.ResponseProductModel;
import com.aiatelye.leather.dto.UpdateProductModelRequest;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProductModelMapper {


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProductModel toProductModelEntity(RequestCreateProductModel request);

    @Mapping(target = "primaryImageUrl",
            expression = "java(getPrimaryImageUrl(entity))")
    ResponseProductModel toProductModelResponse(ProductModel entity);


    ResponseProductImage toProductImageResponse(ProductImage image);

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
