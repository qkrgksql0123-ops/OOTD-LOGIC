package com.trion.ootd.repository;

import com.trion.ootd.entity.Recommendation;

import java.util.List;
import java.util.Optional;

/**
 * AI 추천 결과(Recommendation) DynamoDB 리포지토리 인터페이스
 */
public interface RecommendationRepository {

    /**
     * 추천 결과 저장
     */
    void save(Recommendation recommendation);

    /**
     * 특정 날짜의 추천 결과 조회
     */
    Optional<Recommendation> findByUserIdAndDate(String userId, String recommendDate);

    /**
     * 사용자의 모든 추천 결과 조회
     */
    List<Recommendation> findByUserId(String userId);

    /**
     * 사용자의 특정 기간 추천 결과 조회
     */
    List<Recommendation> findByUserIdBetweenDates(String userId, String startDate, String endDate);

    /**
     * 추천 결과 삭제
     */
    void delete(String userId, String recommendDate);

    /**
     * 사용자의 최신 추천 조회 (내림차순)
     */
    List<Recommendation> findLatestRecommendations(String userId, int limit);
}
