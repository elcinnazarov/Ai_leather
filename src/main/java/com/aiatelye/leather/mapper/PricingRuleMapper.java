package com.aiatelye.leather.mapper;

import com.aiatelye.leather.dao.PricingRule;
import com.aiatelye.leather.dto.admin.price.Rule.CreatePricingRuleRequest;
import com.aiatelye.leather.dto.admin.price.manuel.PricingRuleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface PricingRuleMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    PricingRule toPricingRuleEntity(CreatePricingRuleRequest request);

    @Mapping(target = "formulaDisplay", expression = "java(buildFormulaDisplay(entity))")
    PricingRuleResponse toResponsePricingRule(PricingRule entity);

    default String buildFormulaDisplay(PricingRule rule) {
        String currencySymbol = switch (rule.getTargetCurrency()) {
            case USD -> "$";
            case EUR -> "€";
            default -> rule.getTargetCurrency().name();
        };

        StringBuilder sb = new StringBuilder();
        sb.append(rule.getMultiplier()).append("x");

        if (rule.getFixedAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
            sb.append(" + ").append(currencySymbol).append(rule.getFixedAmount());
        }

        if (Boolean.TRUE.equals(rule.getRoundTo99())) {
            sb.append(", .99");
        }

        return sb.toString();
    }

}
