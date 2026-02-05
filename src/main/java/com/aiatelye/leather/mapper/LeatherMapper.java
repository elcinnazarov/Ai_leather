package com.aiatelye.leather.mapper;


import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.dto.RequestCreatLeather;
import com.aiatelye.leather.dto.ResponseLeather;
import com.aiatelye.leather.dto.UpdateLeatherRequest;
import org.mapstruct.*;

@Mapper(componentModel = "spring",
unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface LeatherMapper {

    @Mapping(target = "leatherName", source = "leatherName")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updateAt", ignore = true)
    @Mapping(target = "leatherName", source = "leatherName")
    @Mapping(target = "grade", ignore = true)
    Leather toLeatherEntity(RequestCreatLeather request);

    @Mapping(source = "leathername", target = "leatherName")
    @Mapping(source = "imageUrl", target = "textureImageUrl")
    @Mapping(source = "grade.gradename", target = "gradeType")
    ResponseLeather toLeatherResponse(Leather entity);

     //Update üçün - PARTIAL (null olanları ignore et)
     @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
     @Mapping(target = "id", ignore = true)
     @Mapping(target = "createdAt", ignore = true)
     @Mapping(target = "updatedAt", ignore = true)
     @Mapping(target = "isActive", ignore = true)        // Başqa endpointdə
     @Mapping(target = "availabilityStatus", ignore = true) // Başqa endpointdə
     @Mapping(target = "grade", ignore = true)           // Manual set edilir
     @Mapping(target = "leathername", source = "leatherName")
     void updateLeatherEntityFromRequest(UpdateLeatherRequest leatherUpdateRequest, @MappingTarget Leather entity);



}
