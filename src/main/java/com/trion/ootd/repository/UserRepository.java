package com.trion.ootd.repository;

import com.trion.ootd.entity.User;

import java.util.Optional;

/**
 * 사용자(User) DynamoDB 리포지토리 인터페이스
 */
public interface UserRepository {

    /**
     * 사용자 정보 저장 또는 업데이트
     */
    void save(User user);

    /**
     * userId로 사용자 정보 조회
     */
    Optional<User> findById(String userId);

    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(String email);

    /**
     * 사용자 정보 삭제
     */
    void delete(String userId);

    /**
     * 사용자가 존재하는지 확인
     */
    boolean existsById(String userId);
}
