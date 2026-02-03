package com.aiatelye.leather.service.admin;
import com.aiatelye.leather.dao.ProductImage;
import com.aiatelye.leather.dao.ProductModel;
import com.aiatelye.leather.dto.CreateProductModelRequest;
import com.aiatelye.leather.dto.ProductModelResponse;
import com.aiatelye.leather.dto.UpdateProductModelRequest;
import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.error.Exception.*;
import com.aiatelye.leather.mapper.ProductModelMapper;
import com.aiatelye.leather.repository.ProductImageRepository;
import com.aiatelye.leather.repository.ProductModelRepository;
import com.aiatelye.leather.service.MinioService;
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


    @Transactional
    public ProductModelResponse createProductModel(
            CreateProductModelRequest request,
            List<MultipartFile> images
    ) {
        log.info("Creating product: {}", request.getModelName());

        // Validation
        if (productModelRepository.existsByModelnameIgnoreCaseAndIsActiveTrue(
                request.getModelName()
        )) {
            throw new BadRequestException("Product already exists: " + request.getModelName());
        }

        if (images == null || images.isEmpty()) {
            throw new BadRequestException ("At least one image required");
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
        return productMapper.toProductModelResponse(saved);

    }

    @Transactional
    public ProductModelResponse addProductImages(Long productId, List<MultipartFile> images) {
        ProductModel product = productModelRepository.findById(productId)
                .orElseThrow(() -> new BadRequestException("Product not found"));

        int currentOrder = product.getImages().size();

        try {
            for (MultipartFile image : images) {

                if (currentOrder>=6) throw  new MultiFileLimitException("Only 6 images allowed");

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
        }
         catch (Exception e) {
            throw new AddProductImagesException(" add Product iMages  error");
        }
    }


    @Transactional
    public void deleteProductImage(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ImageNotFoundException("Image not found"));

        if (image.getIsPrimary()) {
            throw new PrimaryImageException("Cannot delete primary image");
        }

        minioService.deleteImage(image.getImageUrl());
        productImageRepository.delete(image);
        log.info("Image deleted with ID :{}", imageId);
    }

    @Transactional
    public void changePrimaryImage(Long productId, Long imageId) {

        ProductImage image = productImageRepository
                .findById(imageId)
                .orElseThrow(() -> new ImageNotFoundException("Image not found"));

        // təhlükəsizlik üçün tək real check
        if (!image.getProductModel().getId().equals(productId)) {
            throw new ImageNotFoundException("Image does not belong to this product");
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

            if (productModelRepository.existsByModelnameIgnoreCaseAndIsActiveTrueAndIdNot(
                    request.getModelName(), productId)) {
                throw new BadRequestException("Product with name '" + request.getModelName() + "' already exists");
            }
        }

        productMapper.updateProductModelEntity(request, product);

        ProductModel updated = productModelRepository.save(product);
        log.info("Product ID: {} updated successfully", productId);

        return productMapper.toProductModelResponse(updated);
    }

    @Transactional
    public void deleteProductModel(Long productId) {
        log.info("Soft deleting product ID: {}", productId);

        ProductModel product = productModelRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        if (!product.getIsActive()) {
            throw new BadRequestException("Product is already inactive");
        }

        product.setIsActive(false);
        product.setAvailabilityStatus(Enums.AvailabilityStatus.ARCHIVED);

        productModelRepository.save(product);

        log.info("Product ID: {} soft deleted successfully", productId);
    }


    public  ProductModelResponse updateProductModelStatus(Long productId,
                                                           Enums.AvailabilityStatus newStatus) {

        log.info("Updating product ID: {} status to: {}", productId, newStatus);

        ProductModel product = productModelRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

        Enums.AvailabilityStatus currentStatus = product.getAvailabilityStatus();

        // Status transition validate
        validateStatusTransition(currentStatus, newStatus);

        // Status update
        product.setAvailabilityStatus(newStatus);

        // Əgər ARCHIVED edilirsə, isActive də false et
        if (newStatus == Enums.AvailabilityStatus.ARCHIVED) {
            product.setIsActive(false);
        }

        // Əgər ACTIVE edilirsə, isActive true et (əgər əvvəl false idisə)
        if (newStatus == Enums.AvailabilityStatus.ACTIVE) {
            product.setIsActive(true);
        }

        ProductModel updated = productModelRepository.save(product);

        // Cache invalidate
        // cacheService.evictProductCache(productId);

        log.info("Product ID: {} status changed from {} to {}", productId, currentStatus, newStatus);

        return productMapper.toProductModelResponse(updated);
    }

    private void validateStatusTransition(Enums.AvailabilityStatus current, Enums.AvailabilityStatus next) {


        if (current == next) {
            throw new InvalidStateTransitionException("New status must be different from current status");
        }

        boolean validTransition = switch (current) {
            case DRAFT -> next == Enums.AvailabilityStatus.ACTIVE || next == Enums.AvailabilityStatus.ARCHIVED;
            case ACTIVE -> next == Enums.AvailabilityStatus.ARCHIVED;
            case ARCHIVED -> next == Enums.AvailabilityStatus.ACTIVE || next == Enums.AvailabilityStatus.DRAFT;
            default -> false;
        };

        if (!validTransition) {
            throw new InvalidStateTransitionException(
                    String.format("Invalid status transition from %s to %s", current, next)
            );
        }

    }



}




