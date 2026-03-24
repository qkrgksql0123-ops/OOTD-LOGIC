package com.trion.ootd.repository;

import com.trion.ootd.entity.Clothing;

import java.util.List;
import java.util.Optional;

/**
 * 의류(Clothing) DynamoDB 리포지토리 인터페이스
 */
public interface ClothingRepository {

    /**
     * 의류 정보 저장 또는 업데이트
     */
    void save(Clothing clothing);

    /**
     * userId와 id로 의류 정보 조회
     */
    Optional<Clothing> findById(String userId, String id);

    /**
     * userId로 모든 의류 정보 조회
     */
    List<Clothing> findByUserId(String userId);

    /**
     * userId와 category로 의류 정보 조회
     */
    List<Clothing> findByUserIdAndCategory(String userId, String category);

    /**
     * 의류 정보 삭제
     */
    void delete(String userId, String id);

    /**
     * userId의 모든 의류 정보 삭제
     */
    void deleteByUserId(String userId);

    /**
     * 특정 userId의 의류 개수 반환
     */
    long countByUserId(String userId);
}
