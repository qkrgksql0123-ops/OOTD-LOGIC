package com.trion.ootd.repository;

import com.trion.ootd.entity.Clothing;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Repository
public class DynamoDbClothingRepository implements ClothingRepository {

    // 메모리 기반 저장소 (개발/테스트용)
    private static final Map<String, List<Clothing>> clothingStore = new ConcurrentHashMap<>();

    @Override
    public void save(Clothing clothing) {
        log.info("Saving clothing: {}", clothing.getId());
        String userId = clothing.getUserId();
        clothingStore.computeIfAbsent(userId, k -> new ArrayList<>()).add(clothing);
    }

    @Override
    public Optional<Clothing> findById(String userId, String id) {
        log.info("Finding clothing: {} for user: {}", id, userId);
        List<Clothing> userClothings = clothingStore.getOrDefault(userId, new ArrayList<>());
        return userClothings.stream()
                .filter(c -> c.getId().equals(id))
                .findFirst();
    }

    @Override
    public List<Clothing> findByUserId(String userId) {
        log.info("Finding all clothing for user: {}", userId);
        return clothingStore.getOrDefault(userId, new ArrayList<>());
    }

    @Override
    public List<Clothing> findByUserIdAndCategory(String userId, String category) {
        log.info("Finding clothing by category: {} for user: {}", category, userId);
        List<Clothing> userClothings = clothingStore.getOrDefault(userId, new ArrayList<>());
        return userClothings.stream()
                .filter(c -> c.getCategory().equals(category))
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String userId, String id) {
        log.info("Deleting clothing: {} for user: {}", id, userId);
        List<Clothing> userClothings = clothingStore.getOrDefault(userId, new ArrayList<>());
        userClothings.removeIf(c -> c.getId().equals(id));
    }

    @Override
    public void deleteByUserId(String userId) {
        log.info("Deleting all clothing for user: {}", userId);
        clothingStore.remove(userId);
    }

    @Override
    public long countByUserId(String userId) {
        log.info("Counting clothing for user: {}", userId);
        return clothingStore.getOrDefault(userId, new ArrayList<>()).size();
    }
}
