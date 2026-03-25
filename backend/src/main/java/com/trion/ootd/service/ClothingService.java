package com.trion.ootd.service;

import com.trion.ootd.dto.ClothingDTO;
import com.trion.ootd.entity.Clothing;
import com.trion.ootd.repository.ClothingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClothingService {

    private final ClothingRepository clothingRepository;

    public ClothingDTO addClothing(String userId, ClothingDTO clothingDTO) {
        log.info("Adding clothing for user: {}", userId);

        Clothing clothing = Clothing.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .category(clothingDTO.getCategory())
                .imageUrl(clothingDTO.getImageUrl())
                .tags(clothingDTO.getTags())
                .createdAt(LocalDateTime.now().toString())
                .build();

        clothingRepository.save(clothing);
        log.info("Clothing added successfully: {}", clothing.getId());

        return convertToDTO(clothing);
    }

    public Optional<ClothingDTO> getClothingById(String userId, String clothingId) {
        log.info("Getting clothing: {} for user: {}", clothingId, userId);
        return clothingRepository.findById(userId, clothingId)
                .map(this::convertToDTO);
    }

    public List<ClothingDTO> getAllClothing(String userId) {
        log.info("Getting all clothing for user: {}", userId);
        return clothingRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ClothingDTO> getClothingByCategory(String userId, String category) {
        log.info("Getting clothing by category: {} for user: {}", category, userId);
        return clothingRepository.findByUserIdAndCategory(userId, category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteClothing(String userId, String clothingId) {
        log.info("Deleting clothing: {} for user: {}", clothingId, userId);
        clothingRepository.delete(userId, clothingId);
        log.info("Clothing deleted successfully");
    }

    public long getClothingCount(String userId) {
        log.info("Getting clothing count for user: {}", userId);
        return clothingRepository.countByUserId(userId);
    }

    private ClothingDTO convertToDTO(Clothing clothing) {
        return ClothingDTO.builder()
                .id(clothing.getId())
                .userId(clothing.getUserId())
                .category(clothing.getCategory())
                .imageUrl(clothing.getImageUrl())
                .tags(clothing.getTags())
                .createdAt(clothing.getCreatedAt())
                .build();
    }
}
