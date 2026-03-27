package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.CustomDesigns;
import com.aiatelye.leather.dto.AiDesinger.CatalogDesignResponse;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;


import java.util.List;
@Mapper(componentModel = "spring")
public interface AiCatalogMapper {
    @Mapping(source = "id", target = "designId")
    @Mapping(source = "productModel.modelname", target = "productModelName")
    @Mapping(source = "productModel.modelType", target = "productCategory")
    @Mapping(source = "leather.leathername", target = "leatherName")
    @Mapping(source = "leather.color", target = "leatherColor")
    @Mapping(source = "user.name", target = "creatorName")
    @Mapping(source = "hitCount", target = "hitCount")
    @Mapping(target = "priceAzn", expression = "java(calculatePrice(design))")
    CatalogDesignResponse toCatalogResponse(CustomDesigns design);

    List<CatalogDesignResponse> toCatalogResponseList(List<CustomDesigns> designs);

    default PageResponse<CatalogDesignResponse> toCatalogPageResponse(Page<CustomDesigns> page) {
        return PageResponse.<CatalogDesignResponse>builder()
                .content(toCatalogResponseList(page.getContent()))
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    // Qiymət hesablama (məhsul + dəri grade-ə görə)
    default String calculatePrice(CustomDesigns design) {
        try {
            // ProductGradePrice-dən qiymət çəkmə logikası
            // Və ya sabit format
            return "150.00"; // Placeholder - CalculatePriceService integrasiya edilməlidir
        } catch (Exception e) {
            return "0.00";
        }
    }

}
