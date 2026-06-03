package com.trion.ootd.repository;

import com.trion.ootd.entity.Recommendation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryResponse;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Repository
@RequiredArgsConstructor
public class DynamoDbRecommendationRepository implements RecommendationRepository {

    private final DynamoDbClient dynamoDbClient;
    private final DynamoDbEnhancedClient enhancedClient;

    private static final String TABLE_NAME = "Recommendation";

    @Override
    public void save(Recommendation recommendation) {
        log.info("Saving recommendation for user: {}", recommendation.getUserId());
        try {
            DynamoDbTable<Recommendation> table = enhancedClient.table(TABLE_NAME, TableSchema.fromClass(Recommendation.class));
            table.putItem(recommendation);
            log.info("Recommendation saved successfully");
        } catch (Exception e) {
            log.error("Error saving recommendation", e);
        }
    }

    @Override
    public Optional<Recommendation> findByUserIdAndDate(String userId, String date) {
        log.info("Finding recommendation for user: {} on date: {}", userId, date);
        try {
            Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
            expressionAttributeValues.put(":userId", AttributeValue.builder().s(userId).build());
            expressionAttributeValues.put(":date", AttributeValue.builder().s(date).build());

            QueryRequest queryRequest = QueryRequest.builder()
                    .tableName(TABLE_NAME)
                    .keyConditionExpression("userId = :userId AND recommendDate = :date")
                    .expressionAttributeValues(expressionAttributeValues)
                    .build();

            QueryResponse response = dynamoDbClient.query(queryRequest);
            if (response.items() != null && !response.items().isEmpty()) {
                Recommendation recommendation = convertToRecommendation(response.items().get(0));
                return Optional.of(recommendation);
            }
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error finding recommendation", e);
            return Optional.empty();
        }
    }

    @Override
    public List<Recommendation> findByUserId(String userId) {
        log.info("Finding all recommendations for user: {}", userId);
        try {
            Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
            expressionAttributeValues.put(":userId", AttributeValue.builder().s(userId).build());

            QueryRequest queryRequest = QueryRequest.builder()
                    .tableName(TABLE_NAME)
                    .keyConditionExpression("userId = :userId")
                    .expressionAttributeValues(expressionAttributeValues)
                    .build();

            QueryResponse response = dynamoDbClient.query(queryRequest);
            if (response.items() != null) {
                return response.items().stream()
                        .map(this::convertToRecommendation)
                        .collect(Collectors.toList());
            }
            return List.of();
        } catch (Exception e) {
            log.error("Error finding recommendations for user", e);
            return List.of();
        }
    }

    @Override
    public List<Recommendation> findByUserIdBetweenDates(String userId, String startDate, String endDate) {
        log.info("Finding recommendations for user: {} between dates: {} to {}", userId, startDate, endDate);
        try {
            Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
            expressionAttributeValues.put(":userId", AttributeValue.builder().s(userId).build());
            expressionAttributeValues.put(":startDate", AttributeValue.builder().s(startDate).build());
            expressionAttributeValues.put(":endDate", AttributeValue.builder().s(endDate).build());

            QueryRequest queryRequest = QueryRequest.builder()
                    .tableName(TABLE_NAME)
                    .keyConditionExpression("userId = :userId AND recommendDate BETWEEN :startDate AND :endDate")
                    .expressionAttributeValues(expressionAttributeValues)
                    .scanIndexForward(false)
                    .build();

            QueryResponse response = dynamoDbClient.query(queryRequest);
            if (response.items() != null) {
                return response.items().stream()
                        .map(this::convertToRecommendation)
                        .collect(Collectors.toList());
            }
            return List.of();
        } catch (Exception e) {
            log.error("Error finding recommendations between dates", e);
            return List.of();
        }
    }

    @Override
    public List<Recommendation> findLatestRecommendations(String userId, int limit) {
        log.info("Finding latest {} recommendations for user: {}", limit, userId);
        try {
            Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
            expressionAttributeValues.put(":userId", AttributeValue.builder().s(userId).build());

            QueryRequest queryRequest = QueryRequest.builder()
                    .tableName(TABLE_NAME)
                    .keyConditionExpression("userId = :userId")
                    .expressionAttributeValues(expressionAttributeValues)
                    .scanIndexForward(false)
                    .limit(limit)
                    .build();

            QueryResponse response = dynamoDbClient.query(queryRequest);
            if (response.items() != null) {
                return response.items().stream()
                        .map(this::convertToRecommendation)
                        .collect(Collectors.toList());
            }
            return List.of();
        } catch (Exception e) {
            log.error("Error finding latest recommendations", e);
            return List.of();
        }
    }

    @Override
    public void delete(String userId, String date) {
        log.info("Deleting recommendation for user: {} on date: {}", userId, date);
        try {
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("userId", AttributeValue.builder().s(userId).build());
            key.put("recommendDate", AttributeValue.builder().s(date).build());

            DeleteItemRequest deleteRequest = DeleteItemRequest.builder()
                    .tableName(TABLE_NAME)
                    .key(key)
                    .build();

            dynamoDbClient.deleteItem(deleteRequest);
            log.info("Recommendation deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting recommendation", e);
        }
    }

    private Recommendation convertToRecommendation(Map<String, AttributeValue> item) {
        return Recommendation.builder()
                .userId(item.get("userId").s())
                .recommendDate(item.getOrDefault("recommendDate", AttributeValue.builder().s("").build()).s())
                .recommendedOutfits(item.getOrDefault("recommendedOutfits", AttributeValue.builder().s("").build()).s())
                .temperature(Double.parseDouble(item.getOrDefault("temperature", AttributeValue.builder().n("0").build()).n()))
                .weatherCondition(item.getOrDefault("weatherCondition", AttributeValue.builder().s("").build()).s())
                .generatedByModel(item.getOrDefault("generatedByModel", AttributeValue.builder().s("").build()).s())
                .modelVersion(item.getOrDefault("modelVersion", AttributeValue.builder().s("").build()).s())
                .userFeedbackScore(item.get("userFeedbackScore") != null ? Integer.parseInt(item.get("userFeedbackScore").n()) : null)
                .userFeedbackText(item.getOrDefault("userFeedbackText", AttributeValue.builder().s("").build()).s())
                .createdAt(item.getOrDefault("createdAt", AttributeValue.builder().s("").build()).s())
                .build();
    }
}
