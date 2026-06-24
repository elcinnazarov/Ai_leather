package com.aiatelye.leather.controller.admin;

import com.aiatelye.leather.dto.defalutResponse.ApiResponse;
import com.aiatelye.leather.dto.admin.price.Rule.CreatePricingRuleRequest;
import com.aiatelye.leather.dto.admin.price.manuel.PricingRuleResponse;
import com.aiatelye.leather.dto.admin.price.Rule.UpdatePricingRuleRequest;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.service.pricing.PricingRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/admin/pricing")
public class AdminPricingRuleController {

    private  final PricingRuleService pricingRuleService;

    @PostMapping("/rules")
    public ResponseEntity<ApiResponse<PricingRuleResponse>> createPricingRule(
            @RequestBody @Valid CreatePricingRuleRequest request) {

        log.info("POST /api/admin/pricing/rules - Create rule for: {}", request.getTargetCurrency());

        PricingRuleResponse response = pricingRuleService.createPricingRule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/rules")
    public ResponseEntity <ApiResponse<List<PricingRuleResponse>>> getAllPricingRules(
            @RequestParam(required = false,
            defaultValue = "true") boolean activeOnly){


        log.info("GET /api/admin/pricing/rules");

        List <PricingRuleResponse> responsePricingRuleList = pricingRuleService.getAllPricingRules(activeOnly);
        return ResponseEntity.ok(ApiResponse.success(responsePricingRuleList));
    }

    @PutMapping("/rules/{currency}")
    public ResponseEntity<ApiResponse<PricingRuleResponse>> updatePricingRule(
            @PathVariable Enums.Currency currency,
            @RequestBody @Valid UpdatePricingRuleRequest request) {

        log.info("PUT /api/admin/pricing/rules/{} - Update rule", currency);

        PricingRuleResponse response = pricingRuleService.updatePricingRule(currency, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @DeleteMapping("/rules/{currency}")
    public ResponseEntity<ApiResponse<Void>> deletePricingRule(
            @PathVariable Enums.Currency currency) {

        log.info("DELETE /api/admin/pricing/rules/{} - Delete rule", currency);

        pricingRuleService.deletePricingRule(currency);
        return ResponseEntity.ok(ApiResponse.success(null));
    }


}
