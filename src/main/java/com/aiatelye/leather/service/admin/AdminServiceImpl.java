package com.aiatelye.leather.service.admin;
import com.aiatelye.leather.cache.ProductCatalogCacheRepository;
import com.aiatelye.leather.dao.ProductImage;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.admin.product.CreateProductModelRequest;
import com.aiatelye.leather.dto.admin.product.ProductModelResponse;
import com.aiatelye.leather.dto.admin.product.UpdateProductModelRequest;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.error.Exception.*;
import com.aiatelye.leather.mapper.ProductModelMapper;
import com.aiatelye.leather.repository.ProductImageRepository;
import com.aiatelye.leather.repository.ProductModelRepository;
import com.aiatelye.leather.service.Minio.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl {

    private final ProductModelRepository productModelRepository;
    private final ProductImageRepository productImageRepository;
    private final MinioService minioService;
    private final ProductModelMapper productMapper;
    private final ProductCatalogCacheRepository productCatalogCacheRepository;


    @Transactional
    public ProductModelResponse createProductModel(CreateProductModelRequest request,
                                                   List<MultipartFile> images) {

        log.info("Creating product: {}", request.getModelName());

        String normalizedName = request.getModelName().trim();

        if (productModelRepository.existsByModelnameIgnoreCase(normalizedName)) {
            throw new BadRequestException("error.product.already-exists");
        }

        // Validation
        String trimmedName = request.getModelName()
                .trim()
                .replaceAll("\\s+", " ");
        if (productModelRepository.existsBymodelnameIgnoreCaseAndIsActiveTrue(
                trimmedName
        )) {
            throw new BadRequestException("error.product.already-exists");
        }

        if (images == null || images.isEmpty()) {
            throw new BadRequestException("error.image.required");
        }

        // MinIO bucket check
        minioService.ensureBucketExists();

        ProductModel product = productMapper.toProductModelEntity(request);
        // Upload image
        for (int i = 0; i < images.size(); i++) {
            String imageUrl = minioService.uploadImage(images.get(i), Enums.MinioFolderType.PRODUCT);

            ProductImage image = ProductImage.builder()
                    .productModel(product)
                    .imageUrl(imageUrl)
                    .isPrimary(i == 0)
                    .imageOrder(i)
                    .build();

            product.getImages().add(image);
        }

        ProductModel saved = productModelRepository.save(product);
        log.info("Product saved with ID: {}", saved.getId());

        productCatalogCacheRepository.invalidateAllInitialPages();
        log.info("Product catalog cache invalidate");
        return productMapper.toProductModelResponse(saved);

    }

    @Transactional
    public ProductModelResponse addProductImages(Long productId, List<MultipartFile> images) {
        ProductModel product = productModelRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("error.product.not-found"));

        int currentOrder = product.getImages().size();

        try {
            for (MultipartFile image : images) {

                if (currentOrder >= 6) throw new MultiFileLimitException("error.file.max-count", 6);

                String imageUrl = minioService.uploadImage(image, Enums.MinioFolderType.PRODUCT);

                ProductImage productImage = ProductImage.builder()
                        .productModel(product)
                        .imageUrl(imageUrl)
                        .isPrimary(false)
                        .imageOrder(currentOrder++)
                        .build();

                product.getImages().add(productImage);
            }

            ProductModel updated = productModelRepository.save(product);
            return productMapper.toProductModelResponse(updated);
        } catch (Exception e) {
            throw new AddProductImagesException("error.product.images-add-failed");
        }
    }


    @Transactional
    public void deleteProductImage(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ImageNotFoundException("error.image.not-found"));

        if (image.getIsPrimary()) {
            throw new PrimaryImageException("error.image.primary-delete");
        }

        minioService.deleteImage(image.getImageUrl());
        productImageRepository.delete(image);
        log.info("Image deleted with ID :{}", imageId);
    }

    @Transactional
    public void changePrimaryImage(Long productId, Long imageId) {

        ProductImage image = productImageRepository
                .findById(imageId)
                .orElseThrow(() -> new ImageNotFoundException("error.image.not-found"));

        // təhlükəsizlik üçün tək real check
        if (!image.getProductModel().getId().equals(productId)) {
            throw new ImageNotFoundException("error.image.not-belong-product");
        }

        // əvvəlki primary-ni söndür
        productImageRepository.clearPrimaryForProduct(productId);

        // yenisini primary et
        image.setIsPrimary(true);
    }

    @Transactional
    public ProductModelResponse updateProductModel(Long productId, UpdateProductModelRequest request) {
        log.info("Updating product ID: {}", productId);

        ProductModel product = productModelRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        if (request.getModelName() != null &&
                !request.getModelName().equalsIgnoreCase(product.getModelname())) {

            if (productModelRepository.existsBymodelnameIgnoreCaseAndIdNotAndIsActiveTrue(
                    request.getModelName(), productId)) {
                throw new BadRequestException("error.product.inactive");
            }
        }

        productMapper.updateProductModelEntity(request, product);

        ProductModel updated = productModelRepository.save(product);
        log.info("Product ID: {} updated successfully", productId);

        productCatalogCacheRepository.invalidateProductDetail(productId);
        log.info("ProductDeatil  invalidate ");
        return productMapper.toProductModelResponse(updated);
    }

    @Transactional
    public ProductModelResponse updateProductModelStatus(Long productId, Enums.AvailabilityStatus newStatus) {
        log.info("Updating product ID: {} status to: {}", productId, newStatus);

        ProductModel product = productModelRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        Enums.AvailabilityStatus currentStatus = product.getAvailabilityStatus();

        // 1. Zəncirvari Validasiya: Aktivlik yoxlaması
        if (Boolean.FALSE.equals(product.getIsActive()) && newStatus != Enums.AvailabilityStatus.ACTIVE) {
            throw new ResourcePassiveException("error.resource.passive");
        }

        // 2. Enum daxilindəki keçid yoxlaması
        if (!product.getAvailabilityStatus().canTransitionTo(newStatus)) { // <--- BURA DİQQƏT: Başında "!" olmalıdır
            throw new InvalidStateTransitionException("error.status.invalid-transition",
                    product.getAvailabilityStatus(), newStatus);
        }

        // 3. Status və isActive sinxronlaşdırılması
        product.setAvailabilityStatus(newStatus);
        Boolean nextIsActive = newStatus.getAssociatedIsActive();
        if (nextIsActive != null) {
            product.setIsActive(nextIsActive);
        }
        ProductModel updated = productModelRepository.save(product);

        // Cache invalidate--this will be using  future
        //cacheService.evictProductCache(productId);

        log.info("Product ID: {} status changed from {} to {}", productId, currentStatus, newStatus);

        return productMapper.toProductModelResponse(updated);

    }

    @Transactional
    public void deleteProductModel(Long productId) {
        log.info("Soft deleting product ID: {}", productId);

        ProductModel product = productModelRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        if (!product.getIsActive()) {
            throw new BadRequestException("error.product.inactive");
        }

        product.setIsActive(false);
        product.setAvailabilityStatus(Enums.AvailabilityStatus.ARCHIVED);

        productModelRepository.save(product);
        log.info("Leather status updated. ID: {}, New Status: {}", productId, product.getAvailabilityStatus());

        productCatalogCacheRepository.invalidateProductDetail(productId);
        productCatalogCacheRepository.invalidateAllInitialPages();
        log.info("Cache eviction triggered: Product ID [{}] " +
                "detail and all initial pages cleared to ensure data consistency.", productId);
    }


}




