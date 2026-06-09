package com.trion.ootd.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.UUID;

@Slf4j
@Service
public class S3Service {

    private final S3Client s3Client;
    private final String bucket;
    private final String region;

    public S3Service(
            @Value("${aws.s3.bucket}") String bucket,
            @Value("${aws.s3.region:ap-northeast-2}") String region) {
        this.bucket = bucket;
        this.region = region;
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    public String uploadImage(MultipartFile file, String userId) throws Exception {
        String ext = getExtension(file.getOriginalFilename());
        String key = "clothing/" + userId + "/" + UUID.randomUUID() + ext;

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

        String url = "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
        log.info("Uploaded image to S3: {}", url);
        return url;
    }

    public String uploadBase64Image(String base64DataUrl, String userId) throws Exception {
        String mediaType = "image/jpeg";
        String base64Data = base64DataUrl;
        if (base64DataUrl.startsWith("data:")) {
            int semicolon = base64DataUrl.indexOf(';');
            int comma = base64DataUrl.indexOf(',');
            if (semicolon > 0 && comma > semicolon) {
                mediaType = base64DataUrl.substring(5, semicolon);
                base64Data = base64DataUrl.substring(comma + 1);
            }
        }

        String ext = "." + mediaType.substring(mediaType.indexOf('/') + 1).replace("jpeg", "jpg");
        String key = "clothing/" + userId + "/" + UUID.randomUUID() + ext;
        byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(mediaType)
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(imageBytes));

        String url = "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
        log.info("Uploaded base64 image to S3: {}", url);
        return url;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.'));
    }
}