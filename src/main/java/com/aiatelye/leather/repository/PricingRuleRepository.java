package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.PricingRule;

import com.aiatelye.leather.dao.enums.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {
    Optional<PricingRule> findByTargetCurrency(Enums.Currency Currency);

    boolean existsByTargetCurrency(Enums.Currency currency);

    List<PricingRule> findAllByIsActiveTrue();

    Optional<PricingRule> findByTargetCurrencyAndIsActiveTrue(Enums.Currency currency);

    @Query("SELECT r FROM PricingRule r WHERE r.isActive = true")
    List<PricingRule> findAllActive();
}
