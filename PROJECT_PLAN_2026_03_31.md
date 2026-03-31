# 🧥 Trion OOTD-Logic - 프로젝트 계획 및 진행 현황

**최신 업데이트**: 2026.03.31  
**팀장**: 한비  
**프로젝트 상태**: 🔵 Phase 5 - 인증 기능 구현 중

---

## 📊 전체 진행률

```
████████████████░░░░░░░░░░░░░░░░░░░░░░░░ 40% 완료 (25/62 작업)
```

| Phase | 진행률 | 상태 |
|-------|--------|------|
| **Phase 0** | 100% ✅ | 프로젝트 기초 설정 완료 |
| **Phase 1** | 100% ✅ | 엔티티 & Repository 완료 |
| **Phase 2** | 100% ✅ | Controllers & DTOs 완료 |
| **Phase 3** | 100% ✅ | Weather API 통합 완료 |
| **Phase 4** | 100% ✅ | AI 추천 기능 (Gemini) 완료 |
| **Phase 5** | 60% 🔄 | **인증 기능 (Authentication) 진행 중** |
| **Phase 6** | 0% ⏳ | 테스트 & 배포 대기 |

---

## ✅ 완료된 작업 (25개)

### Phase 0: 프로젝트 기초 설정
- [x] **build.gradle** - Gradle 설정, 의존성 관리
- [x] **application.yml** - AWS, Gemini API 설정
- [x] **TRION_PROJECT_DESIGN.md** - 프로젝트 설계 문서
- [x] **README.md** - 프로젝트 개요

### Phase 1: 엔티티 & Repository
- [x] **User.java** - 사용자 정보 엔티티
- [x] **Clothing.java** - 의류 정보 엔티티
- [x] **DailyLog.java** - 착용 이력 엔티티
- [x] **EnvironmentData.java** - 환경 데이터 엔티티
- [x] **LaundrySync.java** - 세탁 상태 관리 엔티티
- [x] **Recommendation.java** - AI 추천 결과 엔티티
- [x] **ClothingRepository.java** & **DynamoDbClothingRepository.java**
- [x] **UserRepository.java** & **DynamoDbUserRepository.java**
- [x] **DailyLogRepository.java** & **DynamoDbDailyLogRepository.java**
- [x] **RecommendationRepository.java** & **DynamoDbRecommendationRepository.java**

### Phase 2: Controllers & DTOs
- [x] **UserController.java** - 사용자 관련 API
- [x] **ClothingController.java** - 의류 관리 API
- [x] **RecommendationController.java** - 추천 API
- [x] **EnvironmentController.java** - 환경 데이터 API
- [x] **UserDTO.java** - 사용자 DTO
- [x] **ClothingDTO.java** - 의류 DTO
- [x] **RecommendationDTO.java** - 추천 DTO
- [x] **EnvironmentDTO.java** - 환경 데이터 DTO
- [x] **DynamoDbConfig.java** - DynamoDB 설정

### Phase 3: Weather API 통합
- [x] **Weather API 통합** - 기상청(KMA) API 연동
- [x] **기온 데이터 수집** - 실시간 날씨 정보 수집
- [x] **프론트엔드 연동** - 대시보드에 날씨 표시

### Phase 4: AI 추천 기능 (Gemini)
- [x] **Gemini AI 통합** - Google Gemini API 연동
- [x] **이미지 분석** - 의류 이미지 분석 (색상, 소재, 카테고리)
- [x] **OOTD 추천** - AI 기반 의류 조합 추천

### Phase 5-1: Frontend 페이지
- [x] **index.html** - 홈 페이지
- [x] **signup.html** - 회원가입 페이지
- [x] **login.html** - 로그인 페이지
- [x] **closet.html** - 옷장 관리 페이지
- [x] **laundry.html** - 세탁 관리 페이지
- [x] **recommend.html** - 추천 페이지
- [x] **mypage.html** - 마이페이지

### Phase 5-2: Frontend JavaScript
- [x] **script.js** - 메인 스크립트
- [x] **signup.js** - 회원가입 로직
- [x] **login.js** - 로그인 로직
- [x] **closet.js** - 옷장 관리 로직
- [x] **laundry.js** - 세탁 관리 로직
- [x] **recommend.js** - 추천 로직
- [x] **mypage.js** - 마이페이지 로직

---

## 🔄 진행 중 (15개) - Phase 5: 인증 기능

### 현재 작업 (60% 완료)

#### 5-1: 인증 인프라 (진행 중)
- [x] **SecurityConfig.java** - Spring Security 설정
  - CORS 설정
  - CSRF 비활성화
  - 세션 관리 설정
  
- [x] **AuthController.java** - 인증 관련 API 엔드포인트
  - `/auth/signup` - 회원가입
  - `/auth/login` - 로그인
  - `/auth/logout` - 로그아웃
  - `/auth/refresh` - 토큰 갱신
  
- [x] **AuthResponse.java** - 인증 응답 DTO
  - accessToken
  - refreshToken
  - user 정보
  
- [x] **LoginRequest.java** - 로그인 요청 DTO
- [x] **SignupRequest.java** - 회원가입 요청 DTO

#### 5-2: 인증 서비스 (미완료)
- [ ] **AuthService.java** - 인증 비즈니스 로직
  - 회원가입 처리
  - 로그인 처리
  - 비밀번호 해싱 (BCryptPasswordEncoder)
  - JWT 토큰 생성

- [ ] **JwtTokenProvider.java** - JWT 토큰 처리
  - 토큰 생성
  - 토큰 검증
  - 토큰에서 사용자정보 추출
  - 토큰 갱신

- [ ] **JwtAuthenticationFilter.java** - JWT 필터
  - 요청에서 토큰 추출
  - 토큰 검증 및 사용자 인증

#### 5-3: 프론트엔드 인증 연동 (진행 중)
- [x] **login.js 업데이트** - 로그인 API 연동
- [x] **signup.js 업데이트** - 회원가입 API 연동
- [ ] **localStorage/sessionStorage** - 토큰 저장 로직
- [ ] **API 요청 인터셉터** - 모든 요청에 토큰 포함

#### 5-4: 백엔드 통합 (미완료)
- [ ] **User.java 업데이트** - 비밀번호 필드 추가
- [ ] **UserService.java 작성** - 사용자 비즈니스 로직
- [ ] **의존성 추가 확인** - JWT 라이브러리 (jjwt, etc.)

---

## ⏳ 예정된 작업 (22개) - Phase 6 & 7

### Phase 6: 고급 기능 (10개)

#### 6-1: 세탁 알고리즘
- [ ] **LaundrySyncService.java** - 세탁 상태 관리
  - 세탁 필요 여부 판단 알고리즘
  - 착용 빈도 계산
  - 세탁 권장 시간 계산

- [ ] **WearFrequencyCalculator.java** - 착용 빈도 계산 유틸리티

#### 6-2: 개인 민감도 학습
- [ ] **PersonalSensitivityProfile.java** - 개인 온도 민감도 저장
- [ ] **SensitivityLearningService.java** - 착용 이력으로부터 학습
  - 같은 온도대에서의 선호 의류 분석
  - 개인별 체감온도 편차 계산

#### 6-3: Google Calendar 연동 (선택사항)
- [ ] **GoogleCalendarConfig.java** - 설정
- [ ] **GoogleCalendarService.java** - 달력 조회 및 연동
- [ ] **OAuth 2.0 구현** - 사용자 인증

#### 6-4: 추가 API 최적화
- [ ] **캐싱 전략** - Redis 또는 Spring Cache
- [ ] **API 레이트 제한** - DDoS 방지
- [ ] **에러 처리 표준화** - GlobalExceptionHandler

### Phase 7: 테스트 & 배포 (12개)

#### 7-1: 테스트 작성 (4개)
- [ ] **AuthServiceTest.java** - 인증 기능 단위 테스트
- [ ] **ClothingServiceTest.java** - 의류 관리 테스트
- [ ] **IntegrationTest.java** - API 통합 테스트
- [ ] **Frontend 자동화 테스트** - Selenium/Cypress 사용

#### 7-2: 성능 최적화 (3개)
- [ ] **데이터베이스 쿼리 최적화**
- [ ] **API 응답 시간 모니터링** - CloudWatch
- [ ] **번들 크기 최적화** - Frontend

#### 7-3: AWS 배포 (3개)
- [ ] **Elastic Beanstalk 설정** - 백엔드 배포
- [ ] **S3 + CloudFront** - 프론트엔드 배포
- [ ] **DynamoDB 프로덕션 설정** - 테이블 용량 최적화

#### 7-4: 최종 검토 (2개)
- [ ] **보안 감시** - 비밀번호 암호화 확인, API 보안
- [ ] **문서화** - API 문서, 배포 가이드

---

## 🎯 현재 작업 (Han-Bi Branch)

### 진행 상황: 🟡 인증 기능 구현 중

**완료된 것:**
```
backend/
├── config/SecurityConfig.java ✅
├── controller/AuthController.java ✅
└── dto/
    ├── AuthResponse.java ✅
    ├── LoginRequest.java ✅
    └── SignupRequest.java ✅

frontend/
├── login.js ✅
└── signup.js ✅
```

**남은 것:**
```
1. AuthService.java - 인증 로직 구현
2. JwtTokenProvider.java - JWT 토큰 처리
3. JwtAuthenticationFilter.java - 필터 체인
4. User.java 업데이트 - 비밀번호 필드
5. 프론트엔드 토큰 저장 로직
```

---

## 📅 마일스톤 (제안)

| 날짜 | 목표 | 상태 |
|------|------|------|
| **2026.03.31** | 인증 기본 구조 완성 (현재) | 🟡 진행 중 |
| **2026.04.07** | 인증 전체 기능 완성 | ⏳ 예정 |
| **2026.04.14** | 통합 테스트 완료 | ⏳ 예정 |
| **2026.04.21** | AWS 배포 완료 | ⏳ 예정 |
| **2026.04.28** | 최종 발표 준비 | ⏳ 예정 |

---

## 👥 팀 역할 분담

| 담당 | 역할 | 진행 상황 |
|------|------|---------|
| **한비 (팀장)** | 백엔드 전체: 인증, 비즈니스 로직, AWS | 🟡 인증 구현 중 |
| **최민우** | 프론트엔드: UI/UX, 스타일, 사용자 상호작용 | ✅ 페이지 구현 완료 |
| **주현빈** | DB/알고리즘: 세탁 로직, 민감도 학습 | ⏳ 백엔드 완료 대기 |

---

## 🔗 배운 내용 & 기술 스택

### 백엔드
- **Spring Boot 3.5** - 프레임워크
- **Spring Security** - 인증/인가
- **AWS DynamoDB** - NoSQL DB
- **Google Gemini API** - AI 이미지 분석
- **JWT** - 토큰 기반 인증 (진행 중)

### 프론트엔드
- **Vanilla JavaScript (ES6+)** - 프레임워크 없음
- **HTML5 + CSS3** - 마크업 및 스타일
- **Fetch API** - 백엔드 통신

### 외부 API
- **KMA 날씨 API** - 기상청 실시간 날씨
- **Google Gemini** - AI 추천
- **Google Calendar** - (향후 예정)

---

## 📝 다음 액션 아이템

### 🔴 즉시 필요 (1-2일)
1. [ ] **AuthService.java 구현** - 핵심 인증 로직
   ```java
   public AuthResponse signup(SignupRequest request)
   public AuthResponse login(LoginRequest request)
   public AuthResponse logout()
   public AuthResponse refresh(String refreshToken)
   ```

2. [ ] **JwtTokenProvider.java 구현** - JWT 처리
   ```java
   public String generateAccessToken(String userId)
   public String generateRefreshToken(String userId)
   public String getUserIdFromToken(String token)
   public boolean validateToken(String token)
   ```

3. [ ] **User.java 업데이트** - 비밀번호 저장
   ```java
   private String password; // 암호화되어 저장
   private String salt; // 비밀번호 솔트
   ```

### 🟡 곧 필요 (3-5일)
4. [ ] **프론트엔드 토큰 저장** - login.js 수정
   ```javascript
   localStorage.setItem('accessToken', response.accessToken);
   localStorage.setItem('refreshToken', response.refreshToken);
   ```

5. [ ] **API 인터셉터** - 모든 요청에 토큰 포함
   ```javascript
   const apiCall = (url, options) => {
       const token = localStorage.getItem('accessToken');
       headers['Authorization'] = `Bearer ${token}`;
   }
   ```

6. [ ] **build.gradle 의존성 확인**
   ```gradle
   implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
   implementation 'io.jsonwebtoken:jjwt-impl:0.12.3'
   implementation 'io.jsonwebtoken:jjwt-jackson:0.12.3'
   ```

### 🟢 나중에 필요 (1-2주)
7. [ ] 고급 기능 (세탁 알고리즘, 민감도 학습)
8. [ ] 전체 테스트 작성
9. [ ] AWS 배포

---

## 📊 기술 부채 & 위험요소

| 항목 | 심각도 | 해결 방안 |
|------|--------|---------|
| JWT 토큰 만료 처리 | 🟡 중간 | Refresh Token 구현 |
| 비밀번호 보안 | 🔴 높음 | BCryptPasswordEncoder 필수 |
| CORS 보안 | 🟡 중간 | allowedOrigins 제한 필수 |
| 데이터 검증 | 🟡 중간 | @Valid 및 @Validated 추가 |
| 에러 처리 | 🟡 중간 | GlobalExceptionHandler 구현 |

---

**마지막 정보 갱신**: 2026년 3월 31일  
**다음 리뷰 예정**: 2026년 4월 7일