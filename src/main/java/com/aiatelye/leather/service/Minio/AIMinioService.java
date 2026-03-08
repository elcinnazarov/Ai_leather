package com.aiatelye.leather.service.Minio;

import com.aiatelye.leather.error.Exception.AIImageProcessingException;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIMinioService {


    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucketName;

    @Value("${minio.url}")
    private String minioUrl;

    @Value("${minio.folders.ai}")
    private String aiFolder;

    // ==========================================
    // AI CALLBACK ÜÇÜN YENI METHODLAR
    // ==========================================

    /**
     * n8n-dən gələn Base64 şəkili MinIO-ya yükləyir
     * Sizin mövcud service-dən fərqli: Base64 qəbul edir, MultipartFile yox!
     */
    public AIImageUploadResult uploadGeneratedImage(String base64Image, Long designId, String extension) {
        try {
            // Base64 decode
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);

            // Object key yarad: ai/designs/789/uuid.png
            // Sizin generateFileName() formatına uyğun
            String objectKey = generateAIObjectKey(designId, extension);

            // MinIO-ya yüklə
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .stream(new ByteArrayInputStream(imageBytes), imageBytes.length, -1)
                            .contentType("image/" + extension)
                            .build()
            );

            log.info("AI image uploaded: designId={}, objectKey={}, size={} bytes",
                    designId, objectKey, imageBytes.length);

            return AIImageUploadResult.builder()
                    .objectKey(objectKey)
                    .presignedUrl(generatePresignedUrl(objectKey))  // 1 saat
                    .publicUrl(buildPublicUrl(objectKey))
                    .build();

        } catch (IllegalArgumentException e) {
            log.error(" Invalid Base64: designId={}", designId);
            throw new AIImageProcessingException("Invalid Base64 image data {}" +e);
        } catch (Exception e) {
            log.error("  MinIO upload failed: designId={}", designId, e);
            throw new AIImageProcessingException("Failed to upload AI image to MinIO {}"+ e);
        }
    }

    /**
     * URL-dən şəkil yükləyib MinIO-ya yazır (alternativ)
     */
    public AIImageUploadResult uploadFromUrl(String imageUrl, Long designId) {
        try {
            URL url = new URL(imageUrl);
            URLConnection connection = url.openConnection();
            connection.setConnectTimeout(10000);  // 10 saniyə timeout
            connection.setReadTimeout(30000);     // 30 saniyə read timeout

            String contentType = connection.getContentType();
            String extension = extractExtension(contentType, imageUrl);

            try (InputStream inputStream = connection.getInputStream()) {
                byte[] imageBytes = inputStream.readAllBytes();

                // Maksimum ölçü yoxla (10MB)
                if (imageBytes.length > 10 * 1024 * 1024) {
                    throw new AIImageProcessingException("Image too large: " + imageBytes.length + " bytes");
                }

                String objectKey = generateAIObjectKey(designId, extension);

                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectKey)
                                .stream(new ByteArrayInputStream(imageBytes), imageBytes.length, -1)
                                .contentType(contentType)
                                .build()
                );

                log.info(" AI image from URL uploaded: designId={}, source={}", designId, imageUrl);

                return AIImageUploadResult.builder()
                        .objectKey(objectKey)
                        .presignedUrl(generatePresignedUrl(objectKey))
                        .publicUrl(buildPublicUrl(objectKey))
                        .build();
            }

        } catch (Exception e) {
            log.error(" Failed to upload from URL: designId={}, url={}", designId, imageUrl, e);
            throw new AIImageProcessingException("Failed to download and upload image from URL :{}"+ e);
        }
    }

    // ==========================================
    // HELPER METHODS (Sizin Kodlarınız Əsasında)
    // ==========================================

    /**
     * Sizin generateFileName() formatına uyğun
     */
    private String generateAIObjectKey(Long designId, String extension) {
        // Format: ai/designs/789/ai_a1b2c3d4.png
        // Sizin kodunuz: String.format("%s/%s_%s%s", folder, folder, UUID, extension)
        return String.format("%s/designs/%d/ai_%s.%s",
                aiFolder,
                designId,
                UUID.randomUUID().toString().substring(0, 8),
                extension);
    }

    /**
     * Sizin getFileUrl() formatına uyğun
     */
    private String buildPublicUrl(String objectKey) {
        // Format: http://minio:9000/bucket/ai/designs/789/ai_xxx.png
        return String.format("%s/%s/%s", minioUrl, bucketName, objectKey);
    }

    /**
     * Presigned URL yarat (vaxtı bitən)
     */
    private String generatePresignedUrl(String objectKey) {
        try {
            return minioClient.getPresignedObjectUrl(
                    io.minio.GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectKey)
                            .expiry(60, TimeUnit.MINUTES)
                            .build()
            );
        } catch (Exception e) {
            log.error(" Failed to generate presigned URL: {}", objectKey, e);
            // Fallback: public URL qaytar
            return buildPublicUrl(objectKey);
        }
    }

    private String extractExtension(String contentType, String url) {
        if (contentType != null) {
            return switch (contentType) {
                case "image/png" -> "png";
                case "image/jpeg", "image/jpg" -> "jpg";
                case "image/webp" -> "webp";
                default -> "png";
            };
        }
        // URL-dən çıxar
        if (url.endsWith(".png")) return "png";
        if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "jpg";
        if (url.endsWith(".webp")) return "webp";
        return "png";
    }


    public String getPresignedUrl(String objectKey) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectKey)
                            .expiry(60, TimeUnit.MINUTES)
                            .build()
            );
        } catch (Exception e) {
            log.error("Presigned URL generation failed: {}", objectKey, e);
            throw new AIImageProcessingException("URL generation failed: " + e.getMessage());
        }
    }

    // ==========================================
    // DTO


    @lombok.Data
    @lombok.Builder
    public static class AIImageUploadResult {
        private String objectKey;       // ai/designs/789/ai_a1b2c3d4.png
        private String presignedUrl;    // 1 saatlıq URL (frontend üçün)
        private String publicUrl;       // Daimi URL (fallback)
    }
}
