package com.aiatelye.leather.service.DeliveryCountry;


import com.aiatelye.leather.dao.DeliveryCountryConfig;
import com.aiatelye.leather.dto.DeliveryCountry.DeliveryCountryResponse;
import com.aiatelye.leather.dto.DeliveryCountry.ToggleCountryRequest;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.repository.DeliveryCountryConfigRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryCountryConfigService {

    private final DeliveryCountryConfigRepository repository;

    @Transactional(readOnly = true)
    public List<DeliveryCountryResponse> getActiveCountries() {
        return repository.findByIsActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DeliveryCountryResponse> getAllCountries() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryCountryResponse toggleCountry(String countryCode, ToggleCountryRequest request, String adminEmail) {
        DeliveryCountryConfig country = repository.findByCountryCode(countryCode)
                .orElseThrow(() -> new NotFoundException("Country not found with code: " + countryCode));

        country.setIsActive(request.getIsActive());

        if (Boolean.FALSE.equals(request.getIsActive())) {
            country.setDisabledAt(LocalDateTime.now());
            country.setDisabledBy(adminEmail);
        } else {
            country.setDisabledAt(null);
            country.setDisabledBy(null);
        }

        repository.save(country);
        log.info("Country {} status changed to {} by {}", countryCode, request.getIsActive(), adminEmail);

        return toResponse(country);
    }

    @Transactional
    public void initializeCountries(List<CountrySeedData> countries) {
        int count = 0;
        for (CountrySeedData seed : countries) {
            if (!repository.existsByCountryCode(seed.getCode())) {
                DeliveryCountryConfig config = DeliveryCountryConfig.builder()
                        .countryCode(seed.getCode())
                        .countryName(seed.getName())
                        .isActive(true)
                        .build();
                repository.save(config);
                count++;
            }
        }
        if (count > 0) {
            log.info("Initialized {} new countries", count);
        }
    }

    private DeliveryCountryResponse toResponse(DeliveryCountryConfig entity) {
        return DeliveryCountryResponse.builder()
                .id(entity.getId())
                .countryCode(entity.getCountryCode())
                .countryName(entity.getCountryName())
                .isActive(entity.getIsActive())
                .disabledAt(entity.getDisabledAt())
                .disabledBy(entity.getDisabledBy())
                .build();
    }

    @Data
    @AllArgsConstructor
    public static class CountrySeedData {
        private String code;
        private String name;
    }
}
