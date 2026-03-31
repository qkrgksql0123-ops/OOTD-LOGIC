package com.trion.ootd.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DynamoDbTableInitializer {

    private final DynamoDbClient dynamoDbClient;

    @Bean
    public ApplicationRunner initializeDynamoDbTables() {
        return args -> {
            try {
                createUserTableIfNotExists();
                log.info("DynamoDB tables initialized successfully");
            } catch (Exception e) {
                log.error("Failed to initialize DynamoDB tables", e);
            }
        };
    }

    private void createUserTableIfNotExists() {
        try {
            ListTablesResponse listTablesResponse = dynamoDbClient.listTables();

            if (!listTablesResponse.tableNames().contains("User")) {
                log.info("Creating User table...");

                CreateTableRequest createTableRequest = CreateTableRequest.builder()
                        .tableName("User")
                        .keySchema(
                                KeySchemaElement.builder()
                                        .attributeName("userId")
                                        .keyType(KeyType.HASH)
                                        .build()
                        )
                        .attributeDefinitions(
                                AttributeDefinition.builder()
                                        .attributeName("userId")
                                        .attributeType(ScalarAttributeType.S)
                                        .build(),
                                AttributeDefinition.builder()
                                        .attributeName("email")
                                        .attributeType(ScalarAttributeType.S)
                                        .build()
                        )
                        .globalSecondaryIndexes(
                                GlobalSecondaryIndex.builder()
                                        .indexName("EmailIndex")
                                        .keySchema(
                                                KeySchemaElement.builder()
                                                        .attributeName("email")
                                                        .keyType(KeyType.HASH)
                                                        .build()
                                        )
                                        .projection(Projection.builder()
                                                .projectionType(ProjectionType.ALL)
                                                .build())
                                        .provisionedThroughput(ProvisionedThroughput.builder()
                                                .readCapacityUnits(5L)
                                                .writeCapacityUnits(5L)
                                                .build())
                                        .build()
                        )
                        .billingMode(BillingMode.PROVISIONED)
                        .provisionedThroughput(ProvisionedThroughput.builder()
                                .readCapacityUnits(5L)
                                .writeCapacityUnits(5L)
                                .build())
                        .build();

                dynamoDbClient.createTable(createTableRequest);
                log.info("User table created successfully");

                Thread.sleep(2000);
            } else {
                log.info("User table already exists");
            }
        } catch (ResourceInUseException e) {
            log.info("User table already exists");
        } catch (Exception e) {
            log.error("Error creating User table", e);
        }
    }
}