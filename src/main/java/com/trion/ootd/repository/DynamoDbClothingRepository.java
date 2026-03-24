package com.trion.ootd.repository;

import com.trion.ootd.entity.Clothing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * DynamoDB를 사용한 의류(Clothing) 리포지토리 구현체
 */
@Repository
@RequiredArgsConstructor
public class DynamoDbClothingRepository implements ClothingRepository {

    private static final String TABLE_NAME = "Clothing";

    private final DynamoDbEnhancedClient enhancedClient;

    private DynamoDbTable<Clothing> getTable() {
        return enhancedClient.table(TABLE_NAME, TableSchema.fromBean(Clothing.class));
    }

    @Override
    public void save(Clothing clothing) {
        getTable().putItem(clothing);
    }

    @Override
    public Optional<Clothing> findById(String userId, String id) {
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(id)
                .build();

        Clothing clothing = getTable().getItem(key);
        return Optional.ofNullable(clothing);
    }

    @Override
    public List<Clothing> findByUserId(String userId) {
        QueryConditional queryConditional = QueryConditional.keyEqualTo(
                Key.builder().partitionValue(userId).build()
        );

        QueryEnhancedRequest query = QueryEnhancedRequest.builder()
                .queryConditional(queryConditional)
                .build();

        return getTable().query(query)
                .stream()
                .flatMap(page -> page.items().stream())
                .toList();
    }

    @Override
    public List<Clothing> findByUserIdAndCategory(String userId, String category) {
        QueryConditional queryConditional = QueryConditional.keyEqualTo(
                Key.builder().partitionValue(userId).build()
        );

        Expression filterExpression = Expression.builder()
                .expression("category = :category")
                .expressionValues(Map.of(":category", AttributeValue.builder().s(category).build()))
                .build();

        QueryEnhancedRequest query = QueryEnhancedRequest.builder()
                .queryConditional(queryConditional)
                .filterExpression(filterExpression)
                .build();

        return getTable().query(query)
                .stream()
                .flatMap(page -> page.items().stream())
                .toList();
    }

    @Override
    public void delete(String userId, String id) {
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(id)
                .build();

        getTable().deleteItem(key);
    }

    @Override
    public void deleteByUserId(String userId) {
        List<Clothing> clothings = findByUserId(userId);
        clothings.forEach(clothing -> delete(userId, clothing.getId()));
    }

    @Override
    public long countByUserId(String userId) {
        return findByUserId(userId).size();
    }
}
