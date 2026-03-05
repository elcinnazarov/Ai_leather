package com.aiatelye.leather.service.Order;

import com.aiatelye.leather.dao.ShippingLocation;
import com.aiatelye.leather.dto.admin.shiping.AdminShippingLocationResponse;
import com.aiatelye.leather.dto.admin.shiping.CreateShippingLocationRequest;
import com.aiatelye.leather.dto.admin.shiping.UpdateShippingLocationRequest;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.error.Exception.ConflictException;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.mapper.AdminShippingMapper;
import com.aiatelye.leather.repository.ShippingLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminShippingService {

    private final ShippingLocationRepository locationRepository;
    private final AdminShippingMapper shippingMapper;

    @Transactional(readOnly = true)
    public PageResponse<AdminShippingLocationResponse> getAllLocations(int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<ShippingLocation> pageResult = locationRepository.findAll(pageable);

        List<AdminShippingLocationResponse> content = pageResult.getContent().stream()
                .map(shippingMapper::toResponse)
                .toList();

        return PageResponse.<AdminShippingLocationResponse>builder()
                .content(content)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }


    public AdminShippingLocationResponse getLocationById(Long id) {

        ShippingLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shipping location not found: " + id));

        return shippingMapper.toResponse(location);
    }


    @Transactional
    public AdminShippingLocationResponse createLocation(CreateShippingLocationRequest request) {

        // Uniqueness check: country + cityName
        Optional<ShippingLocation> existing = locationRepository
                .findByCountryAndCityName(request.getCountry(), request.getCityName());

        if (existing.isPresent()) {
            throw new ConflictException("Shipping location already exists for this country and city");
        }

        ShippingLocation location = ShippingLocation.builder()
                .country(request.getCountry())
                .cityName(request.getCityName())
                .fee(request.getFee())
                .currency(request.getCurrency())
                .freeThreshold(request.getFreeThreshold())
                .requiresPostalCode(request.getRequiresPostalCode())
                .isActive(true)
                .build();

        ShippingLocation saved = locationRepository.save(location);

        return shippingMapper.toResponse(saved);
    }

    @Transactional
    public AdminShippingLocationResponse updateLocation(Long id, UpdateShippingLocationRequest request) {

        ShippingLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shipping location not found: " + id));

        // Yalnız fee, freeThreshold, requiresPostalCode, isActive dəyişə bilər
        // Country və cityName dəyişdirilməz (uniqueness pozular)

        location.setFee(request.getFee());
        location.setFreeThreshold(request.getFreeThreshold());
        location.setRequiresPostalCode(request.getRequiresPostalCode());
        location.setIsActive(request.getIsActive());

        ShippingLocation updated = locationRepository.save(location);

        return shippingMapper.toResponse(updated);
    }

    @Transactional
    public AdminShippingLocationResponse toggleLocation(Long id) {

        ShippingLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shipping location not found: " + id));

        location.setIsActive(!location.getIsActive());

        ShippingLocation updated = locationRepository.save(location);

        return shippingMapper.toResponse(updated);
    }

    @Transactional
    public void deleteLocation(Long id) {

        ShippingLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Shipping location not found: " + id));

        // Optional: Check if location used in any orders before delete
        // If used, throw ConflictException

        locationRepository.delete(location);
    }
}
