package com.aiatelye.leather.service.catalog;

import com.aiatelye.leather.Specification.LeatherSpecification;
import com.aiatelye.leather.cache.LeatherCatalogCacheRepository;
import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.dao.LeatherGrade;
import com.aiatelye.leather.dto.catalog.*;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.mapper.LeatherCatalogMapper;
import com.aiatelye.leather.repository.LeatherGradeRepository;
import com.aiatelye.leather.repository.LeatherRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeatherCatalogService {

    private final LeatherRepository leatherRepository;
    private final LeatherCatalogMapper leatherCatalogMapper;
    private  final LeatherGradeRepository leatherGradeRepository;
    private final LeatherCatalogCacheRepository leatherCatalogCacheRepository;
    private  final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public PageResponse<LeatherListResponse> getLeathers(LeatherFilterRequest filter) {
        log.info("Fetching leathers with filter: {}", filter);

        String filterKey = buildFilterKey(filter);
        int pagecache = filter.getPage();

        Optional<String> cached = leatherCatalogCacheRepository.getLeatherList(filterKey, pagecache);
        if (cached.isPresent()) {
            log.info("Leather list has been cached");
            try {
                return objectMapper.readValue(cached.get(),
                        objectMapper.getTypeFactory().constructParametricType(
                                PageResponse.class, LeatherListResponse.class));
            } catch (Exception e) {
                log.error("Failed to parse cache", e);
            }
        }

        Pageable pageable = PageRequest.of(
                filter.getPage(),
                filter.getSize(),
                Sort.by(Sort.Direction.ASC, "grade.gradeLevel", "leathername")
        );

        Page<Leather> page = leatherRepository.findAll(
                LeatherSpecification.withFilter(filter),
                pageable
        );

        List<LeatherListResponse> content = page.getContent().stream()
                .map(leatherCatalogMapper::toListResponse)
                .collect(Collectors.toList());


        PageResponse<LeatherListResponse> response =PageResponse.<LeatherListResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();

        try {
            leatherCatalogCacheRepository.cacheLeatherList(filterKey, pagecache,
                    objectMapper.writeValueAsString(response));
        } catch (Exception e) {
            log.error("Failed to cache", e);
        }

        return response;

    }

    private String buildFilterKey(LeatherFilterRequest filter) {
        return filter.getColor() + ":" + filter.getOrigin() + ":" + filter.getGradeType();
    }


    @Transactional(readOnly = true)
    public LeatherDetailResponse getLeatherDetail(Long leatherId) {

        var cachedJson = leatherCatalogCacheRepository.getLeatherDetail(leatherId);
        if (cachedJson.isPresent()) {
            try {
                log.info("Leather detail cache hit: {}", leatherId);
                return objectMapper.readValue(cachedJson.get(), LeatherDetailResponse.class);
            } catch (Exception e) {
                log.error("Failed to parse leather detail cache", e);
            }
        }
        log.info("Fetching leather detail: {}", leatherId);

        Leather leather = leatherRepository.findByIdWithDetails(leatherId)
                .orElseThrow(() -> new NotFoundException("Leather not found: " + leatherId));

        LeatherDetailResponse leatherDetailResponse= leatherCatalogMapper.toDetailResponse(leather);
        // 4. KEŞLƏ
        try {
            String json = objectMapper.writeValueAsString(leatherDetailResponse);
            leatherCatalogCacheRepository.cacheLeatherDetail(leatherId, json);
        } catch (Exception e) {
            log.error("Failed to cache leather detail", e);
        }

        return leatherDetailResponse;
    }


    @Transactional(readOnly = true)
    public PageResponse<LeatherByGradeResponse> getLeathersByGrade(
            Enums.GradeType gradeType, int page, int size) {

        log.info("Fetching leathers by grade: {}, page: {}, size: {}", gradeType, page, size);


        var cachedJson = leatherCatalogCacheRepository.getLeathersByGrade(gradeType.name(), page);

        if (cachedJson.isPresent()) {
            try {
                log.info("Leathers by grade cache hit: {} page {}", gradeType, page);
                return objectMapper.readValue(cachedJson.get(),
                        new TypeReference<PageResponse<LeatherByGradeResponse>>() {});
            } catch (Exception e) {
                log.error("Failed to parse cache", e);
            }
        }
        //DB
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.ASC, "leathername")
        );

        Page<Leather> leatherPage = leatherRepository.findByGradeType(gradeType, pageable);

        List<LeatherByGradeResponse> content = leatherPage.getContent().stream()
                .map(leatherCatalogMapper::toResponse)
                .collect(Collectors.toList());

        PageResponse<LeatherByGradeResponse> response = PageResponse.<LeatherByGradeResponse>builder()
                .content(content)
                .pageNumber(leatherPage.getNumber())
                .pageSize(leatherPage.getSize())
                .totalElements(leatherPage.getTotalElements())
                .totalPages(leatherPage.getTotalPages())
                .last(leatherPage.isLast())
                .build();

        // Kesh
        try {
            String json = objectMapper.writeValueAsString(response);
           leatherCatalogCacheRepository.cacheLeathersByGrade(gradeType.name(), page, json);
        } catch (Exception e) {
            log.error("Failed to cache", e);
        }

        return response;
    }


    @Transactional(readOnly = true)
    public List<GradeListResponse> getAllGrades() {
        log.info("Fetching all grades");
        var cachedJson = leatherCatalogCacheRepository.getGradeList();
        if (cachedJson.isPresent()) {
            try {
                log.info("Grade list cache hit");
                return objectMapper.readValue(cachedJson.get(),
                        new TypeReference<List<GradeListResponse>>() {
                        });
            } catch (Exception e) {
                log.error("Failed to parse grade list cache", e);
            }
        }
        List<Object[]> results = leatherRepository.findAllWithLeatherCount();

// 3. MAP ET
        List<GradeListResponse> response = results.stream()
                .map(result -> {
                    LeatherGrade grade = (LeatherGrade) result[0];
                    Long count = (Long) result[1];

                    GradeListResponse dto = leatherCatalogMapper.toResponse(grade);
                    dto.setLeatherCount(count.intValue());
                    return dto;
                })
                .toList();

        try {
            String json = objectMapper.writeValueAsString(response);
            leatherCatalogCacheRepository.cacheGradeList(json);
        } catch (Exception e) {
            log.error("Failed to cache grade list", e);
        }

        return response;
    }




    @Transactional(readOnly = true)
    public LeatherGradeDetailResponse getGradeDetail(Long gradeId) {
        log.info("Fetching grade detail: {}", gradeId);

        var cachedJson = leatherCatalogCacheRepository.getGradeDetail(gradeId);
        if (cachedJson.isPresent()) {
            try {
                log.info("Grade detail cache hit: {}", gradeId);
                return objectMapper.readValue(cachedJson.get(), LeatherGradeDetailResponse.class);
            } catch (Exception e) {
                log.error("Failed to parse grade detail cache", e);
            }
        }

        LeatherGrade grade = leatherGradeRepository.findById(gradeId)
                .orElseThrow(() -> new NotFoundException("Grade not found: " + gradeId));

        LeatherGradeDetailResponse response =leatherCatalogMapper.toDetailResponse(grade);

        // 4. KEŞLƏ
        try {
            String json = objectMapper.writeValueAsString(response);
            leatherCatalogCacheRepository.cacheGradeDetail(gradeId, json);
        } catch (Exception e) {
            log.error("Failed to cache grade detail", e);
        }

        return response;
    }
}
