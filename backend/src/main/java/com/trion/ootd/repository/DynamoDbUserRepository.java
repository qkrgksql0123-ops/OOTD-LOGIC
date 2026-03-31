package com.trion.ootd.repository;

import com.trion.ootd.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.QueryRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryResponse;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Repository
@RequiredArgsConstructor
public class DynamoDbUserRepository implements UserRepository {

    private final DynamoDbClient dynamoDbClient;
    private final DynamoDbEnhancedClient enhancedClient;

    private static final String TABLE_NAME = "User";

    @Override
    public Optional<User> findById(String userId) {
        log.info("Finding user by ID: {}", userId);
        try {
            DynamoDbTable<User> table = enhancedClient.table(TABLE_NAME, TableSchema.fromClass(User.class));
            Key key = Key.builder().partitionValue(userId).build();
            User user = table.getItem(key);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            log.error("Error finding user by ID: {}", userId, e);
            return Optional.empty();
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        log.info("Finding user by email: {}", email);
        try {
            Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
            expressionAttributeValues.put(":email", AttributeValue.builder().s(email).build());

            QueryRequest queryRequest = QueryRequest.builder()
                    .tableName(TABLE_NAME)
                    .indexName("EmailIndex")
                    .keyConditionExpression("email = :email")
                    .expressionAttributeValues(expressionAttributeValues)
                    .build();

            QueryResponse response = dynamoDbClient.query(queryRequest);
            if (response.items() != null && !response.items().isEmpty()) {
                Map<String, AttributeValue> item = response.items().get(0);
                User user = convertToUser(item);
                return Optional.of(user);
            }
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error finding user by email: {}", email, e);
            return Optional.empty();
        }
    }

    @Override
    public void save(User user) {
        log.info("Saving user: {}", user.getUserId());
        try {
            DynamoDbTable<User> table = enhancedClient.table(TABLE_NAME, TableSchema.fromClass(User.class));
            table.putItem(user);
            log.info("User saved successfully: {}", user.getUserId());
        } catch (Exception e) {
            log.error("Error saving user: {}", user.getUserId(), e);
        }
    }

    @Override
    public void delete(String userId) {
        log.info("Deleting user: {}", userId);
        try {
            DynamoDbTable<User> table = enhancedClient.table(TABLE_NAME, TableSchema.fromClass(User.class));
            Key key = Key.builder().partitionValue(userId).build();
            table.deleteItem(key);
            log.info("User deleted successfully: {}", userId);
        } catch (Exception e) {
            log.error("Error deleting user: {}", userId, e);
        }
    }

    @Override
    public boolean existsById(String userId) {
        log.info("Checking if user exists: {}", userId);
        return findById(userId).isPresent();
    }

    private User convertToUser(Map<String, AttributeValue> item) {
        return User.builder()
                .userId(item.get("userId").s())
                .email(item.getOrDefault("email", AttributeValue.builder().s("").build()).s())
                .passwordHash(item.getOrDefault("passwordHash", AttributeValue.builder().s("").build()).s())
                .nickname(item.getOrDefault("nickname", AttributeValue.builder().s("").build()).s())
                .tempSensitivity(Integer.parseInt(item.getOrDefault("tempSensitivity", AttributeValue.builder().n("5").build()).n()))
                .skinTone(item.getOrDefault("skinTone", AttributeValue.builder().s("").build()).s())
                .createdAt(item.getOrDefault("createdAt", AttributeValue.builder().s("").build()).s())
                .updatedAt(item.getOrDefault("updatedAt", AttributeValue.builder().s("").build()).s())
                .lastLoginAt(item.getOrDefault("lastLoginAt", AttributeValue.builder().s("").build()).s())
                .deactivated(Boolean.parseBoolean(item.getOrDefault("deactivated", AttributeValue.builder().bool(false).build()).bool().toString()))
                .build();
    }
}
