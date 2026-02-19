package com.aiatelye.leather.controller.catalog;

import com.aiatelye.leather.dto.catalog.*;
import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.service.catalog.LeatherCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leathers")
@RequiredArgsConstructor
@Slf4j
public class LeatherController {


    private final LeatherCatalogService leatherCatalogService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<LeatherListResponse>>> getLeathers(
            @Valid @ModelAttribute LeatherFilterRequest filter) {

        log.info("GET /api/leathers - filter: {}", filter);

        PageResponse<LeatherListResponse> response = leatherCatalogService.getLeathers(filter);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeatherDetailResponse>> getLeatherDetail(
            @PathVariable Long id) {

        log.info("GET /api/leathers/{} - Leather detail requested", id);

        LeatherDetailResponse response = leatherCatalogService.getLeatherDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/by-grade/{gradeType}")
    public ResponseEntity<ApiResponse<PageResponse<LeatherByGradeResponse>>> getLeathersByGrade(
            @PathVariable Enums.GradeType gradeType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("GET /api/leathers/by-grade/{} - page: {}, size: {}", gradeType, page, size);

        PageResponse<LeatherByGradeResponse> response =
                leatherCatalogService.getLeathersByGrade(gradeType, page, size);

        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<GradeListResponse>>> getAllGrades() {

        log.info("GET /api/grades - All grades requested");

        List<GradeListResponse> response =leatherCatalogService.getAllGrades();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeatherGradeDetailResponse>> getGradeDetail(
            @PathVariable Long id) {

        log.info("GET /api/grades/{} - Grade detail requested", id);

        LeatherGradeDetailResponse response = leatherCatalogService.getGradeDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
