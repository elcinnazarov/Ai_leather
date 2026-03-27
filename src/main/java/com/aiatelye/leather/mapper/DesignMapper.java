package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.CustomDesigns;
import com.aiatelye.leather.dto.AiDesinger.DesignResponse;
import com.aiatelye.leather.dto.AiDesinger.MyDesignsResponse;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DesignMapper {

    @Mapping(target = "designId", source = "id")
    @Mapping(target = "isCustom", source = "custom")
    @Mapping(target = "message", constant = "Dizayn emal olunur")
    DesignResponse toResponse(CustomDesigns design);


    @Mapping(source = "id", target = "designId")
    @Mapping(source = "productModel.modelname", target = "productModelName")
    @Mapping(source = "leather.leathername", target = "leatherName")
    MyDesignsResponse toMyDesignsResponse(CustomDesigns design);

    List<MyDesignsResponse> toMyDesignsResponseList(List<CustomDesigns> designs);

    default PageResponse<MyDesignsResponse> toMyDesignsPageResponse(Page<CustomDesigns> page) {
        return PageResponse.<MyDesignsResponse>builder()
                .content(toMyDesignsResponseList(page.getContent()))
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}

