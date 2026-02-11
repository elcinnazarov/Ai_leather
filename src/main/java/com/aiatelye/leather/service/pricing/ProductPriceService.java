package com.aiatelye.leather.service.pricing;

import com.aiatelye.leather.dao.LeatherGrade;
import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.*;
import com.aiatelye.leather.error.Exception.BadRequestException;
import com.aiatelye.leather.error.Exception.NotFoundException;
import com.aiatelye.leather.mapper.ProductGradePriceMapper;
import com.aiatelye.leather.repository.LeatherGradeRepository;
import com.aiatelye.leather.repository.ProductGradePriceRepository;
import com.aiatelye.leather.repository.ProductModelRepository;
import com.aiatelye.leather.repository.cache.PriceCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductPriceService {
    private final ProductGradePriceRepository priceRepository;
    private final ProductModelRepository productModelRepository;
    private final LeatherGradeRepository gradeRepository;
    private final ProductGradePriceMapper productGradePriceMapper;
    private  final PriceCacheRepository priceCacheRepository;

    @Transactional
    public ListProductPriceResponse createProductPrices(Long productModelId, ListCreateProductPricesRequest request) {
        log.info("Creating prices for product: {} with {} grades", productModelId, request.getPrices().size());

        // 1. Product tap
        ProductModel product = productModelRepository.findById(productModelId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productModelId));

        // 2. Yoxla product active-dir mi
        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new BadRequestException("Cannot set prices for inactive product");
        }

        List<ProductPriceResponse> successList = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        // 3. Hər bir qiyməti işlə
        for (CreateProductPriceRequest priceRequest : request.getPrices()) {
            try {
                // Duplicate check
                if (priceRepository.existsByProductModelIdAndGradeId(productModelId, priceRequest.getGradeId())) {
                    errors.add("Grade " + priceRequest.getGradeId() + ": Price already exists");
                    continue;
                }

                // Grade tap
                LeatherGrade grade = gradeRepository.findById(priceRequest.getGradeId())
                        .orElseThrow(() -> new NotFoundException("Grade not found: " + priceRequest.getGradeId()));

                // Create
                ProductGradePrice entity = productGradePriceMapper.toProductGradePriceEntity(priceRequest, product, grade);
                ProductGradePrice saved = priceRepository.save(entity);

                successList.add(productGradePriceMapper.toProductPriceResponse(saved));
                log.info("Price created: product={}, grade={}, price={}",
                        productModelId, grade.getId(), priceRequest.getPrice());

            } catch (Exception e) {
                errors.add("Grade " + priceRequest.getGradeId() + ": " + e.getMessage());
            }
        }

        ListProductPriceResponse response = ListProductPriceResponse.builder()
                .productModelId(productModelId)
                .productModelName(product.getModelname())
                .prices(successList)
                .totalCount(request.getPrices().size())
                .successCount(successList.size())
                .errors(errors)
                .build();

        log.info("Batch complete: {}/{} success", successList.size(), request.getPrices().size());


        return response;

    }

    @Transactional(readOnly = true)
    public ListProductPriceResponse getProductPrices(Long productModelId) {

       log.info("Fetching  prices for proudct {} ",productModelId);

        ProductModel product = productModelRepository.findById(productModelId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productModelId));

        List<ProductGradePrice> prices = priceRepository.
                findByProductModelIdOrderByGradeGradeLevelAsc(productModelId);

        List<ProductPriceResponse> responses =prices.stream()
                .map(productGradePriceMapper::toProductPriceResponse).collect(Collectors.toList());

        ListProductPriceResponse response = new ListProductPriceResponse();
        response.setProductModelId(productModelId);
        response.setProductModelName(product.getModelname());
        response.setPrices(responses);
        response.setTotalCount(responses.size());
        response.setSuccessCount(responses.size());
        response.setErrors(new ArrayList<>());

        return response;
    }

    @Transactional
    public ProductPriceResponse updateProductPrice(Long productModelId, Long gradeId, UpdateProductPriceRequest request) {
        log.info("Updating price for product: {}, grade: {}", productModelId, gradeId);

        ProductGradePrice price = priceRepository.findByProductModelIdAndGradeId(productModelId, gradeId)
                .orElseThrow(() -> new NotFoundException("Price not found for product: " + productModelId + " and grade: " + gradeId));
        BigDecimal oldPrice = price.getPrice();
        price.setPrice(request.getPrice());
        price.setUpdatedAt(java.time.LocalDateTime.now());

        ProductGradePrice updated = priceRepository.save(price);

        log.info("Price updated: {} -> {} for product: {}, grade: {}",
                oldPrice, request.getPrice(), productModelId, gradeId);

        return productGradePriceMapper.toProductPriceResponse(updated);
    }


    public void deleteProductPrice(Long productModelId, Long gradeId) {
        log.info("Deleting price for product: {}, grade: {}", productModelId, gradeId);

        ProductGradePrice price = priceRepository.findByProductModelIdAndGradeId(productModelId, gradeId)
                .orElseThrow(() -> new NotFoundException("Price not found for product: " + productModelId + " and grade: " + gradeId));

        priceRepository.delete(price);

        log.info("Price deleted for product: {}, grade: {}", productModelId, gradeId);
    }

}