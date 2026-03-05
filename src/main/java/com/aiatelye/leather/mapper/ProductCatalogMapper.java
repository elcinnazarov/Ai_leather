package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.ProductImage;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.catalog.product.ProductCatalogResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductCatalogMapper {

    @Mapping(target = "modelName", source = "modelname")
    @Mapping(target = "primaryImageUrl", expression = "java(getPrimaryImageUrl(product))")
    @Mapping(target = "basePrice", ignore = true)
    @Mapping(target = "formattedPrice", ignore = true)
    @Mapping(target = "currency", ignore = true)
    ProductCatalogResponse.ProductSummary toSummary(ProductModel product);

    List<ProductCatalogResponse.ProductSummary> toSummaryList(List<ProductModel> products);

    default String getPrimaryImageUrl(ProductModel product) {
        if (product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }
        return product.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(product.getImages().get(0).getImageUrl());
    }




}
