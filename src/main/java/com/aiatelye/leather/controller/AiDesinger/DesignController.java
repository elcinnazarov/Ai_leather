package com.aiatelye.leather.controller.AiDesinger;

import com.aiatelye.leather.componet.CurrentContext;
import com.aiatelye.leather.dto.AiDesinger.DesignDetailResponse;
import com.aiatelye.leather.dto.AiDesinger.DesignResponse;
import com.aiatelye.leather.dto.AiDesinger.DesignStatusResponse;
import com.aiatelye.leather.dto.AiDesinger.GenerateDesignRequest;
import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.service.design.DesignDetailService;
import com.aiatelye.leather.service.design.DesignGenerationService;
import com.aiatelye.leather.service.design.DesignStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/designs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Design", description = "AI dizayn generasiyası")
public class DesignController {


    private final DesignStatusService designStatusService;
    private final CurrentContext currentContext;
    private final DesignGenerationService designGenerationService;
    private  final DesignDetailService designDetailService;

    @PostMapping("/generate")
    @Operation(summary = "Yeni AI dizayn yarat", description = "Async generasiya başladır")
    public ResponseEntity<DesignResponse> generateDesign(
            @Valid @RequestBody GenerateDesignRequest request) {

        Long userId = currentContext.getCurrentUserId();
        log.info("Design generation requested: userId={}, productModelId={}, leatherId={}",
                userId, request.getProductModelId(), request.getLeatherId());

        DesignResponse response = designGenerationService.generateDesign(userId, request);

        //   Status-a görə HTTP kodu
        HttpStatus httpStatus = response.getStatus().name().equals("SUCCESS")
                ? HttpStatus.OK
                : HttpStatus.ACCEPTED;

        log.info("Design generation response: userId={}, status={}, httpStatus={}",
                userId, response.getStatus(), httpStatus);

        return ResponseEntity.status(httpStatus).body(response);
    }


    @GetMapping("/{id}/status")

    @Operation(summary = "Dizayn statusunu yoxla", description = "Polling üçün - PROCESSING/COMPLETED/FAILED")
    public ResponseEntity<ApiResponse<DesignStatusResponse>> getDesignStatus(@PathVariable Long id) {
        Long userId = currentContext.getCurrentUserId();
        log.info("Status check requested: designId={}, userId={}", id, userId);

        DesignStatusResponse response = designStatusService.getStatus(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @GetMapping("/{id}")
   @Operation(summary = "Dizayn detalları", description = "Lazy Refresh ilə şəkil URL-si avtomatik yenilənir")
    public ResponseEntity<ApiResponse<DesignDetailResponse>> getDesignDetail(@PathVariable Long id) {
        log.info("Design detail requested: designId={}", id);

        DesignDetailResponse response = designDetailService.getDesignDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
