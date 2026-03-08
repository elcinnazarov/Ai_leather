package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.CustomDesigns;
import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.dao.ProductImage;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.AiDesinger.DesignDetailResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface DesignDetailMapper {

    @Mapping(target = "designId", source = "design.id")
    @Mapping(target = "renderImageUrl", source = "freshRenderImageUrl")
    @Mapping(target = "status", source = "design.status")
    @Mapping(target = "promptUsed", source = "design.promptUsed")
    @Mapping(target = "customPrompt", source = "design.customPrompt")
    @Mapping(target = "isCustom", source = "design.custom")
    @Mapping(target = "hitCount", source = "design.hitCount")
    @Mapping(target = "createdAt", source = "design.createdAt")
    @Mapping(target = "product", source = "design.productModel", qualifiedByName = "toProductInfo")
    @Mapping(target = "leather", source = "design.leather", qualifiedByName = "toLeatherInfo")
    DesignDetailResponse toResponse(CustomDesigns design, String freshRenderImageUrl);

    @Named("toProductInfo")
    default DesignDetailResponse.ProductInfo toProductInfo(ProductModel product) {
        if (product == null) return null;

        return DesignDetailResponse.ProductInfo.builder()
                .id(product.getId())
                .name(product.getModelname())
                .modelType(product.getModelType() != null ? product.getModelType().name() : null)
                .description(product.getDescription())
                .primaryImageUrl(getPrimaryImageUrl(product))
                .build();
    }

    @Named("toLeatherInfo")
    default DesignDetailResponse.LeatherInfo toLeatherInfo(Leather leather) {
        if (leather == null) return null;

        return DesignDetailResponse.LeatherInfo.builder()
                .id(leather.getId())
                .name(leather.getLeathername())
                .color(leather.getColor())
                .origin(leather.getOrigin())
                .textureUrl(leather.getImageUrl())
                .gradeName(leather.getGrade() != null ?
                        leather.getGrade().getGradeType().name() : null)
                .build();
    }

    private String getPrimaryImageUrl(ProductModel product) {
        if (product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }
        return product.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(product.getImages().getFirst().getImageUrl());
    }
}
