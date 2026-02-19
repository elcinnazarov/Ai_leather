package com.aiatelye.leather.service.Minio;


import com.aiatelye.leather.enums.Enums;
import com.aiatelye.leather.error.Exception.*;
import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioService {

    private  final MinioClient minioClient;
    @Value("${minio.url}") // YAML-da url yazılıb
    private String minioUrl;

    @Value("${minio.bucket}") // YAML-da bucket yazılıb
    private String bucketName;

    @Value("${minio.image.allowed-extensions}")
    private String allowedExtensions;

    @Value("${minio.image.max-size-mb}")
    private int maxSizeMb;

    @Value("${minio.folders.product}")
    private String productFolder;

    @Value("${minio.folders.leather}")
    private String leatherFolder;

    @Value("${minio.folders.ai}")
    private String aiFolder;

    public void ensureBucketExists() {
        try {
            boolean found = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build()
            );

            if (!found) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build()
                );

                String policy = """
                    {
                        "Version": "2012-10-17",
                        "Statement": [{
                            "Effect": "Allow",
                            "Principal": {"AWS": "*"},
                            "Action": "s3:GetObject",
                            "Resource": "arn:aws:s3:::%s/*"
                        }]
                    }
                    """.formatted(bucketName);

                minioClient.setBucketPolicy(
                        SetBucketPolicyArgs.builder()
                                .bucket(bucketName)
                                .config(policy)
                                .build()
                );

                log.info("✅ MinIO bucket created: {}", bucketName);
            }
        } catch (Exception e) {
            throw new MinioCreatFaildException("Failed to create MinIO bucket");
        }
    }

    public String uploadImage(MultipartFile file, Enums.MinioFolderType minioFolderType) {
        validateImage(file);

        String folder = resolveFolder(minioFolderType);
        String fileName = generateFileName(file, folder);

        String objectPath = buildObjectPath(folder, fileName);

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return getFileUrl(objectPath);

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }


    public void deleteImage(String fileUrl) {
        String fileName = extractFileNameFromUrl(fileUrl);

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .build()
            );
        } catch (Exception e) {
            throw new MinioDeleteException("Failed to delete image");
        }
    }


    private String resolveFolder(Enums.MinioFolderType folderType) {
        return switch (folderType) {
            case PRODUCT -> productFolder;
            case LEATHER -> leatherFolder;
            case AI -> aiFolder;
        };
    }
    private String buildObjectPath(String folder, String fileName) {
        return folder + "/" + fileName;
    }

    private String getFileUrl(String objectPath) {
        return String.format("%s/%s/%s", minioUrl, bucketName, objectPath);
    }

    private String generateFileName(MultipartFile file, String folder) {
        String extension = Objects.requireNonNull(file.getOriginalFilename())
                .substring(file.getOriginalFilename().lastIndexOf("."));
        return String.format("%s/%s_%s%s", folder, folder, UUID.randomUUID(), extension);
    }

    private String extractFileNameFromUrl(String url) {
        int bucketIndex = url.indexOf(bucketName);
        return url.substring(bucketIndex + bucketName.length() + 1);
    }

    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileEmptyException("File is empty");
        }

        long sizeInMb = file.getSize() / (1024 * 1024);
        if (sizeInMb > maxSizeMb) {
            throw new FileTooLargeException( "File too large: " + sizeInMb + "MB");
        }

        String extension = Objects.requireNonNull(file.getOriginalFilename())
                .substring(file.getOriginalFilename().lastIndexOf(".") + 1)
                .toLowerCase();

        List<String> allowed = Arrays.asList(allowedExtensions.split(","));
        if (!allowed.contains(extension)) {
            throw new FileInvalidTypeException("Invalid file type: " + extension);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new FileEmptyException("File is not an image");
        }
    }


}
