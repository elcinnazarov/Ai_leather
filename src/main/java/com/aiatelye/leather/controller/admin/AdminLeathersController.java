package com.aiatelye.leather.controller.admin;

import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.dto.admin.leather.CreatLeatherRequest;
import com.aiatelye.leather.dto.admin.leather.LeatherResponse;
import com.aiatelye.leather.dto.admin.leather.UpdateLeatherRequest;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.service.catalog.LeatherServiceImpl;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/admin/leathers")
public class AdminLeathersController {
    private  final LeatherServiceImpl leatherService;


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LeatherResponse>> createLeather(
            @Parameter(content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
            @RequestPart("data") @Valid CreatLeatherRequest request,
            @RequestPart("image") MultipartFile image
    ) {
        log.info("POST /api/admin/leathers - Create leather request: {}", request.getLeatherName());

        LeatherResponse response= leatherService.createLeather(request, image);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }


    @DeleteMapping("/{leatherId}/image")
    public ResponseEntity<ApiResponse<Void>> deleteLeatherImage(@PathVariable Long leatherId) {

        log.info("DELETE /api/admin/leathers/{}/image - Delete leather image", leatherId);
        leatherService.deleteLeatherImage(leatherId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }


    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LeatherResponse>> updateLeatherImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image) {

        log.info("PUT /api/admin/leathers/{}/image - Update leather image", id);

        LeatherResponse response = leatherService.updateLeatherImage(id, image);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{leatherId}")
    public ResponseEntity<ApiResponse<LeatherResponse>> updateLeather(
            @PathVariable Long leatherId,
            @RequestBody @Valid UpdateLeatherRequest updateLeatherRequest) {

        log.info("PUT /api/admin/leathers/{} - Update leather", leatherId);
        LeatherResponse response = leatherService.updateLeather(leatherId, updateLeatherRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @PutMapping("/{leatherId}/status")
    public ResponseEntity<ApiResponse<LeatherResponse>> updateLeatherStatus(
            @PathVariable Long leatherId,
            @RequestParam Enums.AvailabilityStatus status){

        LeatherResponse response = leatherService.updateLeatherStatus(leatherId, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{leathersId}")
    public ResponseEntity<ApiResponse<Void>> deleteLeather(@PathVariable Long leathersId) {
        leatherService.deleteleather(leathersId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }



}
