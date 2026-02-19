package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.dto.catalog.P_AvailableLeatherResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AvailableLeatherMapper {

    @Mapping(target = "name", source = "leathername")
    @Mapping(target = "gradeType", source = "grade.gradename")
    P_AvailableLeatherResponse toResponse(Leather leather);

    List<P_AvailableLeatherResponse> toResponseList(List<Leather> leathers);
}
