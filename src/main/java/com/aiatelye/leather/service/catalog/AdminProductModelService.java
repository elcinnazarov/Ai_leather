package com.aiatelye.leather.service.catalog;

import com.aiatelye.leather.Specification.ProductModelSpecification;
import com.aiatelye.leather.Specification.ProductModelSpecificationAdmin;
import com.aiatelye.leather.dao.ProductGradePrice;
import com.aiatelye.leather.dao.ProductImage;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.admin.product.AdminGradePriceResponse;
import com.aiatelye.leather.dto.admin.product.AdminProductImageResponse;
import com.aiatelye.leather.dto.admin.product.AdminProductModelResponse;
import com.aiatelye.leather.dto.admin.product.ProductModelFilter;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.mapper.ProductModelMapper;
import com.aiatelye.leather.repository.ProductModelRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminProductModelService {
    @PersistenceContext
    private EntityManager entityManager;
    private final ProductModelRepository productModelRepository;
    private final ProductModelMapper productModelMapper;

    /**
     * Admin bütün product-ları görür:
     * - isActive=false olanlar da
     * - availabilityStatus=DRAFT, ARCHIVED olanlar da
     * - Bütün statuslar
     */
    @Transactional(readOnly = true)
    public PageResponse<AdminProductModelResponse> getProductModels(ProductModelFilter filter, Pageable pageable) {
        log.info("Admin fetching ALL product models (including inactive/draft) with filter: {}", filter);

        Specification<ProductModel> spec = ProductModelSpecificationAdmin.withAdminFilter(filter);

        Page<ProductModel> productPage;
        try {
            productPage = productModelRepository.findAll(spec, pageable);
        } catch (Exception e) {
            log.error("Error fetching product models with specification", e);
            throw new RuntimeException("Could not retrieve product model data");
        }

        List<AdminProductModelResponse> content = productPage.getContent().stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());

        return PageResponse.<AdminProductModelResponse>builder()
                .content(content)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }
    @Transactional(readOnly = true)
    public AdminProductModelResponse getProductModelById(Long id) {
        // ✅ L2 cache-dən sil (Hibernate second-level cache)
        entityManager.getEntityManagerFactory().getCache().evict(ProductModel.class, id);

        // ✅ L1 cache-ni də sil
        entityManager.clear();

        // ✅ İndi 100% DB-dən son vəziyyət
        ProductModel product = productModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product model not found with id: " + id));

        return toAdminResponse(product);
    }

    /**
     * Entity → Admin Response (manual mapping)
     */
    private AdminProductModelResponse toAdminResponse(ProductModel product) {
        // Images
        List<AdminProductImageResponse> imageResponses = product.getImages().stream()
                .map(this::toImageResponse)
                .collect(Collectors.toList());

        // Primary image URL
        String primaryImageUrl = product.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl());

        // Grade Prices
        List<AdminGradePriceResponse> priceResponses = product.getGradePrices() != null
                ? product.getGradePrices().stream()
                .map(this::toGradePriceResponse)
                .collect(Collectors.toList())
                : List.of();

        return AdminProductModelResponse.builder()
                .id(product.getId())
                .modelname(product.getModelname())
                .modelType(product.getModelType())
                .description(product.getDescription())
                .dimensions(product.getDimensions())
                .isActive(product.getIsActive())
                .availabilityStatus(product.getAvailabilityStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .images(imageResponses)
                .primaryImageUrl(primaryImageUrl)
                .gradePrices(priceResponses)
                .imageCount(imageResponses.size())
                .gradePriceCount(priceResponses.size())
                .favoriteCount(product.getFavorites() != null ? product.getFavorites().size() : 0)
                .build();
    }

    private AdminProductImageResponse toImageResponse(ProductImage image) {
        return AdminProductImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .imageOrder(image.getImageOrder())
                .isPrimary(image.getIsPrimary())
                .createdAt(image.getCreatedAt())
                .build();
    }

    private AdminGradePriceResponse toGradePriceResponse(ProductGradePrice price) {
        return AdminGradePriceResponse.builder()
                .id(price.getId())
                .gradeId(price.getGrade() != null ? price.getGrade().getId() : null)
                .gradeType(price.getGrade() != null ? price.getGrade().getGradeType(): null)
                .price(price.getPrice())
                .currency(price.getCurrency() != null ? price.getCurrency().name() : "AZN")
                .manualUsd(price.getManualUsd())
                .manualEur(price.getManualEur())
                .createdAt(price.getCreatedAt())
                .updatedAt(price.getUpdatedAt())
                .build();
    }
}
