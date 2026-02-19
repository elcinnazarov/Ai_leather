package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.ProductImage;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.catalog.ProductDetailResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductDetailMapper {


    @Mapping(target = "modelName", source = "modelname")
    @Mapping(target = "images", expression = "java(mapImages(product.getImages()))")
    @Mapping(target = "primaryImageUrl", expression = "java(getPrimaryImageUrl(product.getImages()))")
    @Mapping(target = "gradePrices", ignore = true) // Service-də set olunur
    @Mapping(target = "currentCurrency", ignore = true) // Service-də set olunur
    ProductDetailResponse toBaseResponse(ProductModel product);

    default List<ProductDetailResponse.ProductImageDTO> mapImages(List<ProductImage> images) {
        if (images == null) return null;
        return images.stream()
                .sorted((a, b) -> Integer.compare(
                        a.getImageOrder() != null ? a.getImageOrder() : 0,
                        b.getImageOrder() != null ? b.getImageOrder() : 0
                ))
                .map(img -> ProductDetailResponse.ProductImageDTO.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .imageOrder(img.getImageOrder())
                        .isPrimary(img.getIsPrimary())
                        .build())
                .collect(Collectors.toList());
    }

    default String getPrimaryImageUrl(List<ProductImage> images) {
        if (images == null || images.isEmpty()) return null;
        return images.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(images.get(0).getImageUrl());
    }
}
