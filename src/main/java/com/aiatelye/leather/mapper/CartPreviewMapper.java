package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.order.CartPreviewRequest;
import com.aiatelye.leather.dto.order.CartPreviewResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Named;
import org.mapstruct.Mapping;
import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface CartPreviewMapper {

    @Mapping(target = "productModelId", source = "product.id")
    @Mapping(target = "productModelName", source = "product.modelname")
    @Mapping(target = "leatherId", source = "leather.id")
    @Mapping(target = "leatherName", source = "leather.leathername")
    @Mapping(target = "quantity", source = "request.quantity")
    @Mapping(target = "oldSeenPrice", source = "request.seenPrice")
    @Mapping(target = "currentUnitPrice", source = "currentUnitPrice")
    @Mapping(target = "priceChanged", source = "priceChanged")
    @Mapping(target = "finalImageUrl",
            expression = "java(determineFinalImageUrl(request.getCustomRenderUrl(), primaryImageUrl, leather.getImageUrl()))")
    @Mapping(target = "isCustomDesign",
            expression = "java(request.getCustomRenderUrl() != null && !request.getCustomRenderUrl().isBlank())")
    @Mapping(target = "available", constant = "true")
   // @Mapping(target = "stockSufficient", constant = "true")
    @Mapping(target = "totalPrice", ignore = true)
    @Mapping(target = "itemErrorMessage", ignore = true)
    CartPreviewResponse.CartItemResponse toItemResponse(
            CartPreviewRequest.CartItemRequest request,
            ProductModel product,
            Leather leather,
            String primaryImageUrl,
            BigDecimal currentUnitPrice,
            Boolean priceChanged);

    @Named("determineFinalImageUrl")
    default String determineFinalImageUrl(String customRenderUrl,
                                          String primaryImageUrl,
                                          String leatherTextureUrl) {
        if (customRenderUrl != null && !customRenderUrl.isBlank()) {
            return customRenderUrl;
        }
        if (primaryImageUrl != null && !primaryImageUrl.isBlank()) {
            return primaryImageUrl;
        }
        return leatherTextureUrl;
    }


}
