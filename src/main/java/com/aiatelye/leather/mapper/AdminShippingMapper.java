package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.ShippingLocation;
import com.aiatelye.leather.dto.admin.shiping.AdminShippingLocationResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AdminShippingMapper {

    AdminShippingLocationResponse toResponse(ShippingLocation location);
}
