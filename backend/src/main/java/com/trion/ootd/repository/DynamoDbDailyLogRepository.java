package com.trion.ootd.repository;

import com.trion.ootd.entity.DailyLog;
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

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Repository
@RequiredArgsConstructor
public class DynamoDbDailyLogRepository implements DailyLogRepository {

    private final DynamoDbClient dynamoDbClient;
    private final DynamoDbEnhancedClient enhancedClient;

    private static final String TABLE_NAME = "DailyLog";

    @Override
    public void save(DailyLog dailyLog) {
        log.info("Saving daily log for user: {}", dailyLog.getUserId());
        try {
            DynamoDbTable<DailyLog> table = enhancedClient.table(TABLE_NAME, TableSchema.fromClass(DailyLog.class));
            table.putItem(dailyLog);
            log.info("Daily log saved successfully");
        } catch (Exception e) {
            log.error("Error saving daily log", e);
        }
    }

    @Override
    public Optional<DailyLog> findByUserIdAndLogDate(String userId, String logDate) {
        log.info("Finding daily log for user: {} on date: {}", userId, logDate);
        try {
            DynamoDbTable<DailyLog> table = enhancedClient.table(TABLE_NAME, TableSchema.fromClass(DailyLog.class));
            Key key = Key.builder()
                    .partitionValue(userId)
                    .sortValue(logDate)
                    .build();
            DailyLog dailyLog = table.getItem(key);
            return Optional.ofNullable(dailyLog);
        } catch (Exception e) {
            log.error("Error finding daily log", e);
            return Optional.empty();
        }
    }

    @Override
    public List<DailyLog> findByUserIdBetweenDates(String userId, String startDate, String endDate) {
        log.info("Finding daily logs for user: {} between dates: {} to {}", userId, startDate, endDate);
        try {
            Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
            expressionAttributeValues.put(":userId", AttributeValue.builder().s(userId).build());
            expressionAttributeValues.put(":startDate", AttributeValue.builder().s(startDate).build());
            expressionAttributeValues.put(":endDate", AttributeValue.builder().s(endDate).build());

            QueryRequest queryRequest = QueryRequest.builder()
                    .tableName(TABLE_NAME)
                    .keyConditionExpression("userId = :userId AND logDate BETWEEN :startDate AND :endDate")
                    .expressionAttributeValues(expressionAttributeValues)
                    .scanIndexForward(false)
                    .build();

            QueryResponse response = dynamoDbClient.query(queryRequest);
            if (response.items() != null) {
                return response.items().stream()
                        .map(this::convertToDailyLog)
                        .collect(Collectors.toList());
            }
            return List.of();
        } catch (Exception e) {
            log.error("Error finding daily logs between dates", e);
            return List.of();
        }
    }

    @Override
    public List<DailyLog> findRecentLogs(String userId, int days) {
        log.info("Finding {} recent days of logs for user: {}", days, userId);
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(days - 1);
            return findByUserIdBetweenDates(userId, startDate.toString(), endDate.toString());
        } catch (Exception e) {
            log.error("Error finding recent logs", e);
            return List.of();
        }
    }

    @Override
    public void delete(String userId, String logDate) {
        log.info("Deleting daily log for user: {} on date: {}", userId, logDate);
        try {
            DynamoDbTable<DailyLog> table = enhancedClient.table(TABLE_NAME, TableSchema.fromClass(DailyLog.class));
            Key key = Key.builder()
                    .partitionValue(userId)
                    .sortValue(logDate)
                    .build();
            table.deleteItem(key);
            log.info("Daily log deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting daily log", e);
        }
    }

    private DailyLog convertToDailyLog(Map<String, AttributeValue> item) {
        return DailyLog.builder()
                .userId(item.get("userId").s())
                .logDate(item.getOrDefault("logDate", AttributeValue.builder().s("").build()).s())
                .outwearClothingId(item.getOrDefault("outwearClothingId", AttributeValue.builder().s("").build()).s())
                .topClothingId(item.getOrDefault("topClothingId", AttributeValue.builder().s("").build()).s())
                .bottomClothingId(item.getOrDefault("bottomClothingId", AttributeValue.builder().s("").build()).s())
                .shoeClothingId(item.getOrDefault("shoeClothingId", AttributeValue.builder().s("").build()).s())
                .temperature(Double.parseDouble(item.getOrDefault("temperature", AttributeValue.builder().n("0").build()).n()))
                .humidity(Double.parseDouble(item.getOrDefault("humidity", AttributeValue.builder().n("0").build()).n()))
                .uvIndex(item.get("uvIndex") != null ? Integer.parseInt(item.get("uvIndex").n()) : null)
                .microDust(item.get("microDust") != null ? Integer.parseInt(item.get("microDust").n()) : null)
                .fineDust(item.get("fineDust") != null ? Integer.parseInt(item.get("fineDust").n()) : null)
                .windSpeed(Double.parseDouble(item.getOrDefault("windSpeed", AttributeValue.builder().n("0").build()).n()))
                .weatherCondition(item.getOrDefault("weatherCondition", AttributeValue.builder().s("").build()).s())
                .scheduledEvents(item.getOrDefault("scheduledEvents", AttributeValue.builder().s("").build()).s())
                .userComfort(item.get("userComfort") != null ? Integer.parseInt(item.get("userComfort").n()) : null)
                .feedback(item.getOrDefault("feedback", AttributeValue.builder().s("").build()).s())
                .createdAt(item.getOrDefault("createdAt", AttributeValue.builder().s("").build()).s())
                .build();
    }
}
