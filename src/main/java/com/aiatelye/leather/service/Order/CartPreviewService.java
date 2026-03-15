package com.aiatelye.leather.service.Order;

import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.dao.ProductImage;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.order.CartPreviewRequest;
import com.aiatelye.leather.dto.order.CartPreviewResponse;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.error.Exception.BadRequestException;
import com.aiatelye.leather.mapper.CartPreviewMapper;
import com.aiatelye.leather.repository.LeatherRepository;
import com.aiatelye.leather.repository.ProductImageRepository;
import com.aiatelye.leather.repository.ProductModelRepository;
import com.aiatelye.leather.service.pricing.CalculatePriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
@Service
public class CartPreviewService {

    private final ProductModelRepository productModelRepository;
    private final LeatherRepository leatherRepository;
    private final ProductImageRepository productImageRepository;
    private final CalculatePriceService calculatePriceService;
    private final CartPreviewMapper cartPreviewMapper;



    @Transactional(readOnly = true)
    public CartPreviewResponse previewCart(CartPreviewRequest request) {
        log.info("Cart preview requested with {} items, currency: {}",
                request.getItems().size(), request.getCurrency());

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Cart cannot be empty.");
        }
        // 1. ID-ləri topla
        List<Long> productIds = extractProductIds(request);
        List<Long> leatherIds = extractLeatherIds(request);



        // 2. Batch fetch (N+1 əleyhinə) - EXCEPTION ATMA, tapılanları qaytar
        Map<Long, ProductModel> productMap = fetchProductsSoft(productIds);
        Map<Long, Leather> leatherMap = fetchLeathersSoft(leatherIds);
        Map<Long, String> primaryImageMap = fetchPrimaryImagesSoft(productIds);

        // 3. Qiymətləri hesabla
        Map<String, BigDecimal> priceMap = calculatePricesBatch(
                request.getItems(), productMap, leatherMap, request.getCurrency());

        // 4. Response build et - Hər item-i fərdi işlə (Soft Fail)
        return buildResponseSoft(request, productMap, leatherMap, primaryImageMap, priceMap);
    }

    private List<Long> extractProductIds(CartPreviewRequest request) {
        return request.getItems().stream()
                .map(CartPreviewRequest.CartItemRequest::getProductModelId)
                .distinct()
                .collect(Collectors.toList());
    }

    private List<Long> extractLeatherIds(CartPreviewRequest request) {
        return request.getItems().stream()
                .map(CartPreviewRequest.CartItemRequest::getLeatherId)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * SOFT: Tapılmayanları exception atmır, sadəcə log yazır
     */
    private Map<Long, ProductModel> fetchProductsSoft(List<Long> productIds) {
        if (productIds.isEmpty()) return new HashMap<>();

        List<ProductModel> products = productModelRepository.findActiveByIds(productIds);

        if (products.size() != productIds.size()) {
            Set<Long> foundIds = products.stream()
                    .map(ProductModel::getId)
                    .collect(Collectors.toSet());
            List<Long> missingIds = productIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .collect(Collectors.toList());
            log.warn("Some products not found or inactive: {}", missingIds);
        }

        return products.stream()
                .collect(Collectors.toMap(ProductModel::getId, Function.identity()));
    }

    /**
     * SOFT: Tapılmayanları exception atmır, sadəcə log yazır
     */
    private Map<Long, Leather> fetchLeathersSoft(List<Long> leatherIds) {
        if (leatherIds.isEmpty()) return new HashMap<>();

        List<Leather> leathers = leatherRepository.findActiveByIds(leatherIds);

        if (leathers.size() != leatherIds.size()) {
            Set<Long> foundIds = leathers.stream()
                    .map(Leather::getId)
                    .collect(Collectors.toSet());
            List<Long> missingIds = leatherIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .collect(Collectors.toList());
            log.warn("Some leathers not found or inactive: {}", missingIds);
        }

        return leathers.stream()
                .collect(Collectors.toMap(Leather::getId, Function.identity()));
    }

    /**
     * SOFT: Xəta olsa boş map qaytarır
     */
    private Map<Long, String> fetchPrimaryImagesSoft(List<Long> productIds) {
        if (productIds.isEmpty()) return new HashMap<>();

        try {
            return productImageRepository.findPrimaryImagesByProductIds(productIds)
                    .stream()
                    .collect(Collectors.toMap(
                            pi -> pi.getProductModel().getId(),
                            ProductImage::getImageUrl,
                            (existing, replacement) -> existing
                    ));
        } catch (Exception e) {
            log.warn("Failed to fetch primary images, continuing without them", e);
            return new HashMap<>();
        }
    }

    private Map<String, BigDecimal> calculatePricesBatch(
            List<CartPreviewRequest.CartItemRequest> items,
            Map<Long, ProductModel> productMap,
            Map<Long, Leather> leatherMap,
            Enums.Currency currency) {

        Map<String, BigDecimal> priceMap = new HashMap<>();

        Set<String> uniqueKeys = items.stream()
                .map(item -> item.getProductModelId() + ":" + item.getLeatherId())
                .collect(Collectors.toSet());

        for (String key : uniqueKeys) {
            String[] parts = key.split(":");
            Long productId = Long.valueOf(parts[0]);
            Long leatherId = Long.valueOf(parts[1]);

            Leather leather = leatherMap.get(leatherId);
            if (leather == null || leather.getGrade() == null) {
                log.error("Leather or grade not found for key: {}", key);
                continue; // Soft fail - qiymət olmadan davam et
            }

            try {
                BigDecimal price = calculatePriceService.getCalculatedPrice(
                        productId,
                        leather.getGrade().getId(),
                        currency
                ).getAmount();

                priceMap.put(key, price);

            } catch (Exception e) {
                log.error("Price calculation failed for product: {}, grade: {}",
                        productId, leather.getGrade().getId(), e);
                // Soft fail - qiymət olmadan davam et
            }
        }

        return priceMap;
    }

    /**
     * SOFT FAIL: Hər item-i fərdi işlə, birində xəta olsa digərləri işləsin
     */
    private CartPreviewResponse buildResponseSoft(
            CartPreviewRequest request,
            Map<Long, ProductModel> productMap,
            Map<Long, Leather> leatherMap,
            Map<Long, String> primaryImageMap,
            Map<String, BigDecimal> priceMap) {

        List<CartPreviewResponse.CartItemResponse> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        boolean allValid = true;

        for (CartPreviewRequest.CartItemRequest itemRequest : request.getItems()) {
            try {
                CartPreviewResponse.CartItemResponse itemResponse = processItemSoft(
                        itemRequest,
                        productMap.get(itemRequest.getProductModelId()),
                        leatherMap.get(itemRequest.getLeatherId()),
                        primaryImageMap,
                        priceMap
                );

                items.add(itemResponse);

                if (Boolean.TRUE.equals(itemResponse.getAvailable()) &&
                        itemResponse.getItemErrorMessage() == null) {
                    totalAmount = totalAmount.add(itemResponse.getTotalPrice());
                } else {
                    allValid = false;
                }

            } catch (Exception e) {
                log.error("Error processing item: {}", itemRequest, e);
                // Item-i error ilə əlavə et
                items.add(buildErrorItem(itemRequest, "Sistem xətası: " + e.getMessage()));
                allValid = false;
            }
        }

        return CartPreviewResponse.builder()
                .valid(allValid)
                .items(items)
                .totalAmount(totalAmount)
                .currency(request.getCurrency())
                .globalErrors(null)
                .build();
    }

    private CartPreviewResponse.CartItemResponse processItemSoft(
            CartPreviewRequest.CartItemRequest itemRequest,
            ProductModel product,
            Leather leather,
            Map<Long, String> primaryImageMap,
            Map<String, BigDecimal> priceMap) {

        Long productId = itemRequest.getProductModelId();
        Long leatherId = itemRequest.getLeatherId();

        // 1. Məhsul yoxlanışı
        if (product == null) {
            log.warn("Product not found: {}", productId);
            return buildErrorItem(itemRequest, "Məhsul artıq mövcud deyil və ya deaktivdir");
        }

        // 2. Dəri yoxlanışı
        if (leather == null) {
            log.warn("Leather not found: {}", leatherId);
            return buildErrorItem(itemRequest, "Dəri artıq mövcud deyil və ya deaktivdir");
        }

        // 3. Qiymət yoxlanışı
        String priceKey = productId + ":" + leatherId;
        BigDecimal currentUnitPrice = priceMap.get(priceKey);

        if (currentUnitPrice == null) {
            log.warn("Price not found for: {}", priceKey);
            return buildErrorItem(itemRequest, "Qiymət hesablanarkən xəta baş verdi");
        }

        // 4. Price Guard - BigDecimal.compareTo() ilə müqayisə (ƏN KRİTİK DÜZƏLIŞ)
        BigDecimal seenPrice = itemRequest.getSeenPrice();
        boolean priceChanged = currentUnitPrice.compareTo(seenPrice) != 0; // compareTo istifadə et

        if (priceChanged) {
            log.warn("Price mismatch for product {}: seen={}, current={}",
                    productId, seenPrice, currentUnitPrice);
        }

        // 5. Şəkil seçimi
        String primaryImageUrl = primaryImageMap.get(productId);

        // 6. Total hesabla
        BigDecimal totalPrice = currentUnitPrice
                .multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);

        // 7. Mapper ilə çevir
        CartPreviewResponse.CartItemResponse response = cartPreviewMapper.toItemResponse(
                itemRequest,
                product,
                leather,
                primaryImageUrl,
                currentUnitPrice,
                priceChanged
        );

        // 8. Mapper-də set olunmayanları əlavə et
        response.setTotalPrice(totalPrice);

        return response;
    }

    private CartPreviewResponse.CartItemResponse buildErrorItem(
            CartPreviewRequest.CartItemRequest itemRequest,
            String errorMessage) {

        return CartPreviewResponse.CartItemResponse.builder()
                .productModelId(itemRequest.getProductModelId())
                .leatherId(itemRequest.getLeatherId())
                .quantity(itemRequest.getQuantity())
                .available(false)
                .priceChanged(false)
                .isCustomDesign(false)
                .itemErrorMessage(errorMessage)
                .build();
    }
}
