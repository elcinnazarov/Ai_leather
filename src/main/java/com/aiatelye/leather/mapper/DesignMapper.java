package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.CustomDesigns;
import com.aiatelye.leather.dto.AiDesinger.DesignResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DesignMapper {

    @Mapping(target = "designId", source = "id")
    @Mapping(target = "isCustom", source = "custom")
    @Mapping(target = "message", constant = "Dizayn emal olunur")
    DesignResponse toResponse(CustomDesigns design);
}

