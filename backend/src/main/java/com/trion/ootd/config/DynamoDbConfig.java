package com.trion.ootd.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.DynamoDbClientBuilder;

import java.net.URI;

/**
 * DynamoDB 클라이언트 설정
 */
@Slf4j
@Configuration
public class DynamoDbConfig {

    @Value("${aws.dynamodb.region:ap-northeast-2}")
    private String region;

    @Value("${aws.dynamodb.endpoint:}")
    private String endpoint;

    /**
     * DynamoDbClient Bean 생성
     * - AWS 자격증명은 DefaultCredentialsProvider로 자동 로드
     * - endpoint가 설정되면 로컬 DynamoDB Local 사용, 없으면 AWS 서비스에 연결
     */
    @Bean
    public DynamoDbClient dynamoDbClient() {
        DynamoDbClientBuilder builder = DynamoDbClient.builder()
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create("test", "test")
                ))
                .region(Region.of(region));

        if (endpoint != null && !endpoint.isBlank()) {
            log.info("DynamoDB endpoint override: {}", endpoint);
            builder.endpointOverride(URI.create(endpoint));
        } else {
            log.info("DynamoDB AWS service connection (region: {})", region);
        }

        return builder.build();
    }

    /**
     * DynamoDbEnhancedClient Bean 생성
     * - 더 높은 수준의 API를 제공하는 클라이언트
     */
    @Bean
    public DynamoDbEnhancedClient dynamoDbEnhancedClient(DynamoDbClient dynamoDbClient) {
        return DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
    }
}
