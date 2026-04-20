package com.trion.ootd.repository;

import com.trion.ootd.entity.Clothing;
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
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Repository
@RequiredArgsConstructor
public class DynamoDbClothingRepository implements ClothingRepository {

    private final DynamoDbClient dynamoDbClient;
    private final DynamoDbEnhancedClient enhancedClient;

    private static final String TABLE_NAME = "Clothing";

    @Override
    public void save(Clothing clothing) {
        log.info("Saving clothing: {}", clothing.getId());
        try {
            DynamoDbTable<Clothing> table = enhancedClient.table(TABLE_NAME, TableSchema.fromClass(Clothing.class));
            table.putItem(clothing);
            log.info("Clothing saved successfully: {}", clothing.getId());
        } catch (Exception e) {
            log.error("Error saving clothing: {}", clothing.getId(), e);
        }
    }

    @Override
    public Optional<Clothing> findById(String userId, String id) {
        log.info("Finding clothing: {} for user: {}", id, userId);
        try {
            DynamoDbTable<Clothing> table = enhancedClient.table(TABLE_NAME, TableSchema.fromClass(Clothing.class));
            Key key = Key.builder()
                    .partitionValue(userId)
                    .sortValue(id)
                    .build();
            Clothing clothing = table.getItem(key);
            return Optional.ofNullable(clothing);
        } catch (Exception e) {
            log.error("Error finding clothing: {}", id, e);
            return Optional.empty();
        }
    }

    @Override
    public List<Clothing> findByUserId(String userId) {
        log.info("Finding all clothing for user: {}", userId);
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
                        .map(this::convertToClothing)
                        .collect(Collectors.toList());
            }
            return List.of();
        } catch (Exception e) {
            log.error("Error finding all clothing for user", e);
            return List.of();
        }
    }

    @Override
    public List<Clothing> findByUserIdAndCategory(String userId, String category) {
        log.info("Finding clothing by category: {} for user: {}", category, userId);
        try {
            Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
            expressionAttributeValues.put(":userId", AttributeValue.builder().s(userId).build());
            expressionAttributeValues.put(":category", AttributeValue.builder().s(category).build());

            QueryRequest queryRequest = QueryRequest.builder()
                    .tableName(TABLE_NAME)
                    .keyConditionExpression("userId = :userId")
                    .filterExpression("category = :category")
                    .expressionAttributeValues(expressionAttributeValues)
                    .build();

            QueryResponse response = dynamoDbClient.query(queryRequest);
            if (response.items() != null) {
                return response.items().stream()
                        .map(this::convertToClothing)
                        .collect(Collectors.toList());
            }
            return List.of();
        } catch (Exception e) {
            log.error("Error finding clothing by category", e);
            return List.of();
        }
    }

    @Override
    public void delete(String userId, String id) {
        log.info("Deleting clothing: {} for user: {}", id, userId);
        try {
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("userId", AttributeValue.builder().s(userId).build());
            key.put("id", AttributeValue.builder().s(id).build());

            DeleteItemRequest deleteRequest = DeleteItemRequest.builder()
                    .tableName(TABLE_NAME)
                    .key(key)
                    .build();

            dynamoDbClient.deleteItem(deleteRequest);
            log.info("Clothing deleted successfully: {}", id);
        } catch (Exception e) {
            log.error("Error deleting clothing: {}", id, e);
        }
    }

    @Override
    public void deleteByUserId(String userId) {
        log.info("Deleting all clothing for user: {}", userId);
        try {
            // 먼저 모든 의류 항목 조회
            List<Clothing> clothings = findByUserId(userId);

            // 각 항목 삭제
            for (Clothing clothing : clothings) {
                delete(userId, clothing.getId());
            }
            log.info("All clothing deleted for user: {}", userId);
        } catch (Exception e) {
            log.error("Error deleting all clothing for user", e);
        }
    }

    @Override
    public long countByUserId(String userId) {
        log.info("Counting clothing for user: {}", userId);
        try {
            Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
            expressionAttributeValues.put(":userId", AttributeValue.builder().s(userId).build());

            QueryRequest queryRequest = QueryRequest.builder()
                    .tableName(TABLE_NAME)
                    .keyConditionExpression("userId = :userId")
                    .expressionAttributeValues(expressionAttributeValues)
                    .select("COUNT")
                    .build();

            QueryResponse response = dynamoDbClient.query(queryRequest);
            return response.count();
        } catch (Exception e) {
            log.error("Error counting clothing for user", e);
            return 0;
        }
    }

    private Clothing convertToClothing(Map<String, AttributeValue> item) {
        return Clothing.builder()
                .id(item.getOrDefault("id", AttributeValue.builder().s("").build()).s())
                .userId(item.getOrDefault("userId", AttributeValue.builder().s("").build()).s())
                .category(item.getOrDefault("category", AttributeValue.builder().s("").build()).s())
                .subcategory(item.getOrDefault("subcategory", AttributeValue.builder().s("").build()).s())
                .color(item.getOrDefault("color", AttributeValue.builder().s("").build()).s())
                .material(item.getOrDefault("material", AttributeValue.builder().s("").build()).s())
                .season(item.getOrDefault("season", AttributeValue.builder().s("").build()).s())
                .thickness(item.get("thickness") != null ? Integer.parseInt(item.get("thickness").n()) : null)
                .imageUrl(item.getOrDefault("imageUrl", AttributeValue.builder().s("").build()).s())
                .tags(item.get("tags") != null ? item.get("tags").ss() : List.of())
                .createdAt(item.getOrDefault("createdAt", AttributeValue.builder().s("").build()).s())
                .isInLaundry(item.get("isInLaundry") != null ? item.get("isInLaundry").bool() : false)
                .lastWornDate(item.getOrDefault("lastWornDate", AttributeValue.builder().s("").build()).s())
                .wearCount(item.get("wearCount") != null ? Integer.parseInt(item.get("wearCount").n()) : 0)
                .build();
    }
}
