# Claude Code 구현 가이드 - OOTD-Logic PRD 기반 3단계 프롬프트

**작성일**: 2026.03.31  
**대상**: 한비 (백엔드 팀장)  
**프로젝트**: OOTD-Logic (오늘의 코디 추천 서비스)

---

## 핵심 기능 (High Priority)

1. **디지털 옷장 관리 (My Closet)** - 의류 데이터 저장
2. **실시간 날씨 연동 (Weather API)** - KMA 기상청 API
3. **날씨 기반 코디 추천 엔진** - AI 기반 스타일 추천

---

## STEP 1: 현황 분석 및 요구사항 정확화

### 목표
현재 구현 상태를 파악하고 남은 작업을 명확히 하기

### 프롬프트 (Claude Code에 복붙)

```
너는 OOTD-Logic 백엔드 개발을 돕는 개발자 어시스턴트다.

현재 프로젝트 상황:
- 엔티티: User, Clothing, DailyLog, EnvironmentData 완료
- Repository: 모두 완료
- Controllers: 4개 완료
- DTOs: 모두 완료
- Weather API: KMA 기상청 API 통합 완료
- AI: Google Gemini API 이미지 분석 및 OOTD 추천 완료
- Auth: SecurityConfig, AuthController, DTOs 완료 (서비스/토큰 미완료)

현재 상태 정리:
1. 현재 상태 요약 (한 문장)
2. 즉시 필요한 작업 Top 3 (우선순위)
3. 각 작업별 예상 구현 복잡도 (낮음/중간/높음)
4. build.gradle에 JWT 라이브러리가 있는지 확인
5. 다음 3주 동안 완성 가능한 작업 추정
```

---

## STEP 2: 아키텍처 설계 및 구현 계획

### 목표
STEP 1 분석 결과를 바탕으로 구현할 아키텍처 설계

### 프롬프트 (Claude Code에 복붙)

```
STEP 1의 분석 결과를 바탕으로 다음을 설계해줘.

OOTD-Logic 백엔드 아키텍처 설계 요청:

기술 스택:
- Backend: Java 17, Spring Boot 3.5.11
- Database: AWS DynamoDB
- Storage: AWS S3 (이미지 저장)
- AI: Google Gemini API
- Auth: JWT (Bearer Token)

현재 구현된 것:
- 엔티티 및 Repository 완료
- Controllers 및 DTOs 완료
- Weather API 통합 완료
- Gemini AI 통합 완료

필요한 설계:

1. AuthService 아키텍처
   - 회원가입 처리
   - 로그인 처리
   - 토큰 갱신
   - 예외 처리 (DuplicateUserException, InvalidPasswordException)

2. JWT 토큰 관리
   - Access Token (1시간)
   - Refresh Token (7일)
   - 토큰 검증

3. 이미지 업로드 API (S3 통합)
   - POST /api/clothing/upload
   - 파일 유효성 검사
   - S3 저장 및 메타데이터 저장

4. 옷 필터링 API
   - GET /api/clothing/filter?category=상의&color=검정
   - DynamoDB Query 사용

5. DailyLog (코디 기록) API
   - POST /api/dailylog
   - GET /api/dailylog/month
   - PATCH /api/dailylog/{logId}

결과:
- 각 기능별 구현 방식
- API 엔드포인트 정의
- 데이터 흐름 (Controller → Service → Repository)
- 예외 처리 전략

설계 완료 후, 구현 순서 추천 (우선순위 순)
```

---

## STEP 3: 코드 구현 (단계적)

### 목표
STEP 2 설계를 바탕으로 실제 코드 구현

### 프롬프트 (Claude Code에 복붙)

```
STEP 2의 아키텍처 설계를 바탕으로 인증 기능을 구현해줘.

구현 요청:

파일 1: JwtTokenProvider.java
요구사항:
- generateAccessToken(String userId) : Access 토큰 생성 (1시간)
- generateRefreshToken(String userId) : Refresh 토큰 생성 (7일)
- getUserIdFromToken(String token) : 토큰에서 userId 추출
- isTokenValid(String token) : 토큰 유효성 검사
- getTokenExpirationTime(String token) : 토큰 만료 시간 반환

기술 요구사항:
- jjwt 라이브러리 사용 (HMAC256)
- application.yml에서 jwt.secret, jwt.expiration 읽기
- 만료된 토큰 예외 처리
- 서명 검증

경로: backend/src/main/java/com/trion/ootd/util/JwtTokenProvider.java

파일 2: JwtAuthenticationFilter.java
요구사항:
- Spring Security Filter로 구현
- 요청 헤더에서 "Authorization: Bearer {token}" 추출
- 토큰 검증 후 SecurityContext에 Authentication 설정
- 공개 경로 (signup, login) 제외

경로: backend/src/main/java/com/trion/ootd/config/JwtAuthenticationFilter.java

파일 3: build.gradle 의존성 확인 및 추가
다음 라이브러리 추가:
- io.jsonwebtoken:jjwt-api:0.12.3
- io.jsonwebtoken:jjwt-impl:0.12.3
- io.jsonwebtoken:jjwt-jackson:0.12.3

파일 4: application.yml 설정 추가
다음 설정 추가:
jwt:
  secret: ${JWT_SECRET_KEY:your-secret-key-minimum-256-bits}
  expiration: 3600000
  refreshExpiration: 604800000

구현 방식:
- 각 파일마다 완전한 코드 (import 포함)
- 주석은 복잡한 로직에만
- Java naming conventions 준수
- 예외 처리: try-catch 또는 throws 선언
```

---

## 순차적 실행 가이드

### Day 1: STEP 1 실행
- 프롬프트 1을 Claude Code에 복붙
- 현황 분석 결과 정리

### Day 2-3: STEP 2 실행
- 프롬프트 2를 Claude Code에 복붙
- 아키텍처 설계 검토

### Day 4-7: STEP 3 실행
- 프롬프트 3을 Claude Code에 복붙
- 인증 기능 구현

---

## 예상 타임라인

| 기간 | 작업 | 상태 |
|------|------|------|
| 3월 31일 | STEP 1 분석 | 대기 |
| 4월 1-2일 | STEP 2 설계 | 대기 |
| 4월 3-5일 | STEP 3 인증 구현 | 대기 |
| 4월 6-10일 | S3 이미지 업로드 | 대기 |
| 4월 11-15일 | 필터링 & OOTD 로그 | 대기 |
| 4월 16-20일 | 테스트 & 배포 | 대기 |

---

## 팁

1. 각 STEP은 독립적으로 실행 가능
2. Claude Code 팁:
   - /plan 커맨드로 먼저 설계 검토
   - 한 번에 3개 파일 이상 생성 시 여러 번에 나눔
   - 컴파일 오류 발생 시 ./gradlew clean build로 점검

---

**작성**: 한비 (팀장)  
**최종 검토**: 2026년 3월 31일