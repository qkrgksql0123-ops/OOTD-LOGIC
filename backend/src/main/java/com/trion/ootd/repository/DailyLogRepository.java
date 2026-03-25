package com.trion.ootd.repository;

import com.trion.ootd.entity.DailyLog;

import java.util.List;
import java.util.Optional;

/**
 * 착용 이력(DailyLog) DynamoDB 리포지토리 인터페이스
 */
public interface DailyLogRepository {

    /**
     * 착용 이력 저장
     */
    void save(DailyLog dailyLog);

    /**
     * 특정 날짜의 착용 이력 조회
     */
    Optional<DailyLog> findByUserIdAndLogDate(String userId, String logDate);

    /**
     * 사용자의 특정 기간 착용 이력 조회
     */
    List<DailyLog> findByUserIdBetweenDates(String userId, String startDate, String endDate);

    /**
     * 사용자의 최근 N일 착용 이력 조회 (AI 학습용)
     */
    List<DailyLog> findRecentLogs(String userId, int days);

    /**
     * 착용 이력 삭제
     */
    void delete(String userId, String logDate);
}
