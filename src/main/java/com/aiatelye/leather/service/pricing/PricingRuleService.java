package com.aiatelye.leather.service.pricing;

import com.aiatelye.leather.dao.PricingRule;
import com.aiatelye.leather.dto.admin.price.Rule.CreatePricingRuleRequest;
import com.aiatelye.leather.dto.admin.price.manuel.PricingRuleResponse;
import com.aiatelye.leather.dto.admin.price.Rule.UpdatePricingRuleRequest;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.error.Exception.BadRequestException;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.error.Exception.PricingRuleAlreadyExistsException;
import com.aiatelye.leather.mapper.PricingRuleMapper;
import com.aiatelye.leather.repository.PricingRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PricingRuleService {
    private final PricingRuleRepository pricingRuleRepository;
    private final PricingRuleMapper pricingRuleMapper;

    @Transactional
    public PricingRuleResponse createPricingRule(CreatePricingRuleRequest request) {
         log.info("Creating pricing rule for currency: {} ({}x + {}, roundTo99: {})",
                request.getTargetCurrency(),
                request.getMultiplier(),
                request.getFixedAmount(),
                request.getRoundTo99());

        // Duplicate check
        if (pricingRuleRepository.existsByTargetCurrency(request.getTargetCurrency())) {
            throw new PricingRuleAlreadyExistsException("Pricing rule already exists for currency: " + request.getTargetCurrency());
        }

        if (request.getMultiplier().compareTo(BigDecimal.ONE) < 0) {
            throw new BadRequestException("Multiplier must be at least 1.0");
        }
        PricingRule entity = pricingRuleMapper.toPricingRuleEntity(request);
        PricingRule saved = pricingRuleRepository.save(entity);

        log.info("Pricing rule saved  to DB");

        return pricingRuleMapper.toResponsePricingRule(saved);
    }


   @Transactional(readOnly = true)
    public List<PricingRuleResponse> getAllPricingRules(boolean activeOnly) {
        log.info("Fetching pricing rules, activeOnly: {}", activeOnly);

        List<PricingRule> rules = activeOnly ? pricingRuleRepository.findAllByIsActiveTrue()
                : pricingRuleRepository.findAll();

        return rules.stream()
                .map(pricingRuleMapper::toResponsePricingRule)
                .collect(Collectors.toList());
    }

    @Transactional
    public PricingRuleResponse updatePricingRule(Enums.Currency currency, UpdatePricingRuleRequest request) {
        log.info("Updating pricing rule for currency: {}", currency);

        // AZN üçün update oluna bilməz
        if (currency == Enums.Currency.AZN) {
            throw new BadRequestException("Cannot update pricing rule for base currency (AZN)");
        }

        PricingRule rule = pricingRuleRepository.findByTargetCurrency(currency).
            orElseThrow(() -> new NotFoundException("Pricing rule not found for currency: " + currency));


        // Update fields (null olmayanlar)
        if (request.getMultiplier() != null) {
            // Validation: multiplier minimum 1.0
            if (request.getMultiplier().compareTo(BigDecimal.ONE) < 0) {
                throw new BadRequestException("Multiplier must be at least 1.0");
            }
            rule.setMultiplier(request.getMultiplier());
        }

        if (request.getFixedAmount() != null) {
            rule.setFixedAmount(request.getFixedAmount());
        }

        if (request.getRoundTo99() != null) {
            rule.setRoundTo99(request.getRoundTo99());
        }

        if (request.getIsActive() != null) {
            rule.setIsActive(request.getIsActive());
        }

        PricingRule updated = pricingRuleRepository.save(rule);
        log.info("Pricing rule updated for {}: {}x + {}, roundTo99: {}",
                updated.getTargetCurrency(),
                updated.getMultiplier(),
                updated.getFixedAmount(),
                updated.getRoundTo99());

        return pricingRuleMapper.toResponsePricingRule(updated);
    }


    public void deletePricingRule(Enums.Currency currency) {
        log.info("Deleting pricing rule for currency: {}", currency);

        if (currency == Enums.Currency.AZN) {
            throw new BadRequestException("AZN is base currency and has no pricing rule to delete");
        }

        PricingRule rule = pricingRuleRepository.findByTargetCurrency(currency)
                .orElseThrow(() -> new NotFoundException("Pricing rule not found for currency: " + currency));

        pricingRuleRepository.delete(rule);
        log.info("Pricing rule deleted for currency: {}", currency);
    }

}
