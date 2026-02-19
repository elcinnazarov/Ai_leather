package com.aiatelye.leather.service.pricing;
import com.aiatelye.leather.config.infrastructure.CurrencyContext;
import com.aiatelye.leather.dao.CalculatedPrice;
import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dto.price.DisplayPriceResponse;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.repository.ProductGradePriceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PriceDisplayService {
    private final ProductGradePriceRepository  productGradePriceRepository;
    private final CalculatePriceService calculatePriceService;


        /* Bütün grade-lər üçün bütün valyutaları hesabla
     *  Bir grade üçün 3 valutanı birdən alır (optimallaşdırılmış)
     */
    @Transactional(readOnly = true)
    public List<DisplayPriceResponse> getProductDisplayPrices(Long productId) {
        log.info("Getting display prices for product: {}", productId);

        List<ProductGradePrice> prices = productGradePriceRepository.findByProductModelId(productId);

        return prices.stream()
                .map(price -> buildDisplayPrice(productId, price))
                .collect(Collectors.toList());
    }

    /**
     * Tək grade üçün bütün valyutaları hesabla
     * YENİ: getAllCalculatedPrices istifadə edir (3 valuta birdən)
     */
    private DisplayPriceResponse buildDisplayPrice(Long productId, ProductGradePrice price) {

        //   Bir dəfə çağır, 3 valuta al
        Map<Enums.Currency, CalculatedPrice> allPrices =
                calculatePriceService.getAllCalculatedPrices(productId, price.getGrade().getId());

        // Map çevirmə
        Map<Enums.Currency, DisplayPriceResponse.PriceDetail> priceMap = new HashMap<>();
        allPrices.forEach((curr, calc) ->
                priceMap.put(curr, buildPriceDetail(calc))
        );

        // Hazırki valyuta
        Enums.Currency currentCurrency = CurrencyContext.getCurrency();
        DisplayPriceResponse.PriceDetail currentDetail = priceMap.get(currentCurrency);

        return DisplayPriceResponse.builder()
                .productId(productId)
                .gradeId(price.getGrade().getId())
                .gradeType(price.getGrade().getGradename().name())
                .prices(priceMap)
                .currentCurrency(currentCurrency)
                .currentAmount(currentDetail.getAmount())
                .currentFormatted(formatPrice(currentDetail.getAmount(), currentCurrency))
                .build();
    }


    /**
     * 1 model 1 gradetype 1 valuta
     * netice bir qiymet
     */
    public DisplayPriceResponse.PriceDetail getQuickPrice(Long productId, Long gradeId,
                                                          Enums.Currency currency) {
        CalculatedPrice calculated = calculatePriceService.getCalculatedPrice(productId, gradeId, currency);
        return buildPriceDetail(calculated);
    }

    private DisplayPriceResponse.PriceDetail buildPriceDetail(CalculatedPrice calculated) {
        return DisplayPriceResponse.PriceDetail.builder()
                .amount(calculated.getAmount())
                .source(calculated.getSource())
                .formatted(formatPrice(calculated.getAmount(), calculated.getCurrency()))
                .ruleMultiplier(calculated.getRuleMultiplier())
                .ruleFixed(calculated.getRuleFixed())
                .build();
    }

    private String formatPrice(BigDecimal amount, Enums.Currency currency) {
        String symbol = switch (currency) {
            case AZN -> "₼";
            case USD -> "$";
            case EUR -> "€";
            default -> currency.name();
        };
        return symbol + amount.setScale(2, RoundingMode.HALF_UP);
    }

}
