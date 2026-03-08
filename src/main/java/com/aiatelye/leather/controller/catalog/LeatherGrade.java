package com.aiatelye.leather.controller.catalog;

import com.aiatelye.leather.dto.catalog.leather.GradeListResponse;
import com.aiatelye.leather.dto.catalog.leather.LeatherGradeDetailResponse;
import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.service.catalog.LeatherCatalogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leatherGrade")
@RequiredArgsConstructor
@Slf4j
public class LeatherGrade {

    private final LeatherCatalogService leatherCatalogService;


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
