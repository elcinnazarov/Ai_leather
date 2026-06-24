package com.aiatelye.leather.service.catalog;
import com.aiatelye.leather.cache.LeatherCacheRepository;
import com.aiatelye.leather.cache.LeatherCatalogCacheRepository;
import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.dao.LeatherGrade;
import com.aiatelye.leather.dto.admin.leather.CreatLeatherRequest;
import com.aiatelye.leather.dto.admin.leather.LeatherResponse;
import com.aiatelye.leather.dto.admin.leather.UpdateLeatherRequest;
import com.aiatelye.leather.dao.enums.Enums;
import com.aiatelye.leather.error.Exception.*;
import com.aiatelye.leather.mapper.LeatherMapper;
import com.aiatelye.leather.repository.LeatherGradeRepository;
import com.aiatelye.leather.repository.LeatherRepository;
import com.aiatelye.leather.service.Minio.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeatherServiceImpl implements LeatherService {
    private final LeatherMapper leatherMapper;
    private final MinioService minioService;
    private final LeatherRepository leatherRepository;
    private final LeatherGradeRepository leatherGradeRepository;
    private  final LeatherCacheRepository leatherCacheRepository;
    private  final LeatherCatalogCacheRepository leatherCatalogCacheRepository;

    @Override
    @Transactional
    public LeatherResponse createLeather(CreatLeatherRequest request, MultipartFile image) {
        log.info("Creating leather: {}", request.getLeatherName());

        if (leatherRepository.existsByleathernameIgnoreCaseAndIsActiveTrue(request.getLeatherName())) {

            throw new BadRequestException(
                    "error.leather.already-exists");
        }

        LeatherGrade grade = leatherGradeRepository.findById(request.getGradeId())
                .orElseThrow(() -> new NotFoundException("Leather grade not found with id: " + request.getGradeId()));

        // MinIO bucket check
        minioService.ensureBucketExists();

        // Upload image
        String imageUrl = minioService.uploadImage(image, Enums.MinioFolderType.LEATHER);
        log.info("Image uploaded: {}", imageUrl);

        Leather leather = leatherMapper.toLeatherEntity(request);
        leather.setImageUrl(imageUrl);
        leather.setGrade(grade);
        Leather saved = leatherRepository.save(leather);
        log.info("Leather  saved at DB: {}", imageUrl);
        clearAllCaches();
        return leatherMapper.toLeatherResponse(saved);

    }

    @Transactional
    public void deleteLeatherImage(Long leatherId) {
        log.info("Deleting image for leather ID: {}", leatherId);

        Leather leather = leatherRepository.findById(leatherId)
                .orElseThrow(() -> new NotFoundException("Leather not found with id: " + leatherId));

        String imageUrl = leather.getImageUrl();

        if (imageUrl == null || imageUrl.isBlank()) {
            throw new BadRequestException("error.leather.no-image");
        }

        // 1. MinIO-dan sil
        try {
            minioService.deleteImage(imageUrl);
            log.info("Image deleted from MinIO: {}", imageUrl);
        } catch (Exception e) {
            log.error("Failed to delete image from MinIO: {}", imageUrl, e);
            throw new MinioDeleteException("error.minio.delete-failed");
        }

        // 2. Entity-dən sil (null et)
        leather.setImageUrl(null);
        leatherRepository.save(leather);
        clearAllCaches();
        log.info("Image URL removed from leather ID: {}", leatherId);

    }

    @Transactional
    public LeatherResponse updateLeatherImage(Long leatherId, MultipartFile newImage) {

        if (newImage == null || newImage.isEmpty()) {
            throw new ImageFileRequired("error.image.required");
        }

        // 1. Leather tap
        Leather leather = leatherRepository.findById(leatherId)
                .orElseThrow(() -> new NotFoundException("Leather not found with id: " + leatherId));

        String oldImageUrl = leather.getImageUrl();

        // 2. Yeni şəkli MinIO-ya yüklə (LEATHER folder)
        String newImageUrl = minioService.uploadImage(newImage, Enums.MinioFolderType.LEATHER);
        log.info("New image uploaded to MinIO: {}", newImageUrl);

        // 3. Köhnə şəkli MinIO-dan sil (əgər varsa)
        if (oldImageUrl != null && !oldImageUrl.isBlank()) {
            try {
                minioService.deleteImage(oldImageUrl);
                log.info("Old image deleted from MinIO: {}", oldImageUrl);
            } catch (Exception e) {
                log.error("Failed to delete old image from MinIO: {}", oldImageUrl, e);

            }
        }

        // 4. Entity-də URL-ni update et
        leather.setImageUrl(newImageUrl);
        leather.setUpdatedAt(LocalDateTime.now());

        Leather updated = leatherRepository.save(leather);
        log.info("Leather ID: {} image updated_successfully", leatherId);
        clearAllCaches();
        return leatherMapper.toLeatherResponse(updated);
    }

    @Transactional
    public LeatherResponse updateLeather(Long leatherId, UpdateLeatherRequest request) {
        log.info("Updating leather ID: {} with data: {}", leatherId, request);

        // 1. Leather tap
        Leather leather = leatherRepository.findById(leatherId)
                .orElseThrow(() -> new NotFoundException("Leather not found with id: " + leatherId));

        // 2. Active yoxlaması (silinmiş leather update oluna bilməz)
        if (!Boolean.TRUE.equals(leather.getIsActive())) {
            throw new ResourcePassiveException("error.leather.passive-update");
        }

        // 3. Duplicate name check (əgər ad dəyişirsə)
        if (request.getLeatherName() != null &&
                !request.getLeatherName().equalsIgnoreCase(leather.getLeathername())) {

            if (leatherRepository.existsByleathernameIgnoreCaseAndIdNotAndIsActiveTrue(
                    request.getLeatherName(), leatherId)) {
                throw new BadRequestException("error.leather.already-exists");
            }
        }

        // 4. MapStruct ilə fieldləri mənimsət (grade ignore olunur)
        leatherMapper.updateLeatherEntityFromRequest(request, leather);

// 5. 🟢 ƏSAS DÜZƏLİŞ: Grade-i manual tapıb set etmək
        if (request.getGradeId() != null) {
            // QEYD: Əgər repository adınız fərqlidirsə (məs: leatherGradeRepository), onu dəyişərsiniz
            LeatherGrade newGrade = leatherGradeRepository.findById(request.getGradeId())
                    .orElseThrow(() -> new NotFoundException("Grade not found with id: " + request.getGradeId()));
            leather.setGrade(newGrade);
        }
        Leather updated = leatherRepository.save(leather);

        log.info("Leather ID: {} updated successfully", leatherId);

        leatherCacheRepository.invalidateAll();
        log.info("Leather ID: {} updated by Admin. Global leather cache invalidated to ensure data consistency.", leatherId);
        clearAllCaches();

        return leatherMapper.toLeatherResponse(updated);
    }

        public LeatherResponse updateLeatherStatus(Long leatherId, Enums.AvailabilityStatus newstatus) {
            log.info("Updating product ID: {} status to: {}", leatherId, newstatus);

            Leather leather = leatherRepository.findById(leatherId)
                    .orElseThrow(() -> new NotFoundException("Product not found with id: " + leatherId));

            Enums.AvailabilityStatus  currentStatus = leather.getAvailabilityStatus();

            // 1. Zəncirvari Validasiya: Aktivlik yoxlaması
            if (Boolean.FALSE.equals(leather.getIsActive()) && newstatus != Enums.AvailabilityStatus.ACTIVE) {
                throw new ResourcePassiveException("error.resource.passive-update");
            }

           /* // 2. Enum daxilindəki keçid yoxlaması
            if (!leather.getAvailabilityStatus().canTransitionTo(newstatus)) {
                throw new InvalidStateTransitionException(
                        "error.status.invalid-transition",
                        leather.getAvailabilityStatus(),
                        newstatus
                );
            }*/
            // 3. Status və isActive sinxronlaşdırılması
            leather.setAvailabilityStatus(newstatus);
            Boolean nextIsActive = newstatus.getAssociatedIsActive();
            if (nextIsActive != null) {
                leather.setIsActive(nextIsActive);
            }
            Leather updated = leatherRepository.save(leather);

            // Cache invalidate--this will be using  future
            //cacheService.evictProductCache(productId);

            log.info("Product ID: {} status changed from {} to {}", leatherId, currentStatus, newstatus);
            clearAllCaches();
            return leatherMapper.toLeatherResponse(updated);
        }


    @Transactional
    public void deleteleather(long leatherId) {
        log.info("Soft deleting leather ID: {}", leatherId);

        Leather leather = leatherRepository.findById(leatherId)
                .orElseThrow(() -> new NotFoundException("Leather not found with id: " + leatherId));

        if (!leather.getIsActive()) {
            throw new ResourcePassiveException("error.leather.already-inactive");
        }

        leather.setIsActive(false);
        leather.setAvailabilityStatus(Enums.AvailabilityStatus.ARCHIVED);

        leatherRepository.save(leather);
        clearAllCaches();
        log.info("Leather status updated. ID: {}, New Status: {}", leatherId, leather.getAvailabilityStatus());
    }


    public void clearAllCaches() {
     try {
         leatherCatalogCacheRepository.invalidateAll();
         log.info("Admin: All caches cleared");
     }catch (Exception e){
         log.error(" LeatherCatalogCacheRepository cleared  be failed ");

     }}
}