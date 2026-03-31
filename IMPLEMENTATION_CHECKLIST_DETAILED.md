# ✅ OOTD-Logic 구현 체크리스트 (상세 버전)

**작성일**: 2026.03.31  
**팀장**: 한비  
**현재 브랜치**: `feature/han-bi-backend`

---

## 🎯 전체 진행률

```
████████████████░░░░░░░░░░░░░░░░░░░░░░░░ 40% (25/62 작업)
```

**다음 목표**: 2026.04.07까지 60% (37/62) 달성

---

## 📍 STEP 1: 기초 인증 인프라 (3-4일) - 🔄 진행 중

### Phase 5-1: 인증 구조 (60% 완료)

#### ✅ 이미 완료된 것
- [x] **SecurityConfig.java** ✅
  - CORS 설정
  - CSRF 비활성화
  - 세션 관리
  - 경로별 권한 설정

- [x] **AuthController.java** ✅
  - `/auth/signup` 엔드포인트
  - `/auth/login` 엔드포인트
  - `/auth/logout` 엔드포인트
  - `/auth/refresh` 엔드포인트

- [x] **AuthResponse.java** ✅
  - accessToken
  - refreshToken
  - user (UserDTO)
  - message

- [x] **LoginRequest.java** ✅
  - email
  - password

- [x] **SignupRequest.java** ✅
  - email
  - password
  - password (confirm)
  - username
  - phone (선택)

#### 🔴 **즉시 필요한 것** (1-2일 내)

**1-1: AuthService.java 구현**
```java
// 경로: backend/src/main/java/com/trion/ootd/service/AuthService.java

메서드 요구사항:
  - signup(SignupRequest) → AuthResponse
    * 이메일 중복 확인
    * 비밀번호 해싱 (BCryptPasswordEncoder)
    * User 저장
    * JWT 토큰 생성 및 반환
  
  - login(LoginRequest) → AuthResponse
    * 이메일로 사용자 조회
    * 비밀번호 검증
    * JWT 토큰 생성 및 반환
  
  - logout(String userId) → void
    * 토큰 블랙리스트 추가 (선택)
  
  - refreshToken(String refreshToken) → AuthResponse
    * Refresh 토큰 검증
    * 새 Access 토큰 생성
  
  - validateToken(String token) → boolean
    * 토큰 유효성 검사

의존성 주입:
  - @Autowired UserRepository userRepository
  - @Autowired JwtTokenProvider jwtTokenProvider
  - @Autowired PasswordEncoder passwordEncoder (BCryptPasswordEncoder)

예외 처리:
  - AuthException: 일반 인증 오류
  - DuplicateUserException: 중복 이메일
  - InvalidPasswordException: 비밀번호 불일치
  - UserNotFoundException: 사용자 없음

로깅:
  - INFO: 회원가입, 로그인 성공 이벤트
  - WARN: 실패한 로그인 시도
  - ERROR: 예외 발생
```

**상태**: [ ] 구현 필요

---

**1-2: JwtTokenProvider.java 구현**
```java
// 경로: backend/src/main/java/com/trion/ootd/util/JwtTokenProvider.java

메서드 요구사항:
  - generateAccessToken(String userId) → String
    * 토큰 만료: 1시간 (3600000 ms)
    * Claims: userId, type: "ACCESS"
  
  - generateRefreshToken(String userId) → String
    * 토큰 만료: 7일 (604800000 ms)
    * Claims: userId, type: "REFRESH"
  
  - getUserIdFromToken(String token) → String
    * 토큰에서 userId claim 추출
  
  - isTokenValid(String token) → boolean
    * 서명 검증
    * 만료 시간 확인
    * 예외 처리
  
  - getTokenExpirationTime(String token) → long
    * 토큰 만료 시간 반환 (밀리초)
  
  - getTokenExpirationDate(String token) → Date
    * 토큰 만료 날짜 반환

기술 요구사항:
  - jjwt 라이브러리 사용
  - HMAC256 알고리즘
  - application.yml에서 jwt.secret 읽기
  - application.yml에서 jwt.expiration 읽기

예외 처리:
  - JwtException: JWT 처리 오류
  - ExpiredJwtException: 만료된 토큰
  - MalformedJwtException: 잘못된 형식
  - SignatureException: 서명 검증 실패

구성 (application.yml):
  jwt:
    secret: ${JWT_SECRET_KEY:your-secret-key-minimum-256-bits-long}
    expiration: 3600000 # 1시간
    refreshExpiration: 604800000 # 7일
```

**상태**: [ ] 구현 필요

---

**1-3: JwtAuthenticationFilter.java 구현**
```java
// 경로: backend/src/main/java/com/trion/ootd/config/JwtAuthenticationFilter.java

기능 요구사항:
  - extends OncePerRequestFilter 구현
  - 모든 요청 처리 전 토큰 검증
  
  메서드:
    - doFilterInternal(HttpServletRequest, HttpServletResponse, FilterChain)
      * Authorization 헤더에서 "Bearer {token}" 추출
      * 토큰 검증
      * 유효하면 SecurityContext에 Authentication 설정
      * 무효하면 401 에러 반환
  
  - extractTokenFromRequest(HttpServletRequest) → String
    * Authorization 헤더 파싱
    * "Bearer " 제거 후 토큰 반환

공개 경로 (인증 제외):
  - /auth/signup
  - /auth/login
  - /auth/refresh
  - / (홈페이지)
  - /static/** (정적 파일)

의존성:
  - JwtTokenProvider jwtTokenProvider
  - UserRepository userRepository

예외 처리:
  - 토큰 없음 → 계속 진행 (나중에 @PreAuthorize에서 처리)
  - 토큰 무효 → 401 Unauthorized
  - 토큰 만료 → 401 Unauthorized
```

**상태**: [ ] 구현 필요

---

**1-4: User.java 업데이트**
```java
// 경로: backend/src/main/java/com/trion/ootd/entity/User.java

추가할 필드:
  - private String password; // BCrypt로 암호화된 비밀번호
  - private String email; // 고유 이메일 (PK로 사용 가능)
  - private String username; // 사용자 이름
  - private String phone; // 전화번호 (선택)
  - private LocalDateTime createdAt; // 가입 시간
  - private LocalDateTime lastLoginAt; // 마지막 로그인
  - private String role; // "USER", "ADMIN" (선택)

수정할 것:
  - DynamoDB @DynamoDBHashKey: email 또는 userId?
  - equals/hashCode: email 기반
  - toString(): 비밀번호 제외

주의사항:
  - 비밀번호는 절대 로그에 기록하면 안 됨
  - 비밀번호는 응답 DTO에 포함하면 안 됨
```

**상태**: [ ] 업데이트 필요

---

**1-5: build.gradle 의존성 확인 및 추가**
```gradle
// 경로: backend/build.gradle

현재 상태 확인:
  - [ ] spring-boot-starter-security 있는가?
  - [ ] io.jsonwebtoken:jjwt-* 있는가?

필요한 의존성 추가:
dependencies {
    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
    
    // Spring Security
    implementation 'org.springframework.boot:spring-boot-starter-security'
    
    // lombok (이미 있으면 OK)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

**상태**: [ ] 확인 및 추가 필요

---

**1-6: application.yml 설정 업데이트**
```yaml
# 경로: backend/src/main/resources/application.yml

추가할 설정:
jwt:
  secret: ${JWT_SECRET_KEY:change-me-in-production-minimum-256-bits-long}
  expiration: 3600000 # 1시간 (밀리초)
  refreshExpiration: 604800000 # 7일 (밀리초)

# Spring Security 설정 (필요시)
spring:
  security:
    user:
      name: admin
      password: admin123
```

**상태**: [ ] 추가 필요

---

### 🎯 STEP 1 완료 기준

- [x] SecurityConfig.java (이미 있음)
- [x] AuthController.java (이미 있음)
- [x] AuthResponse.java (이미 있음)
- [x] LoginRequest.java (이미 있음)
- [x] SignupRequest.java (이미 있음)
- [ ] **AuthService.java** ⬅️ 우선순위 1️⃣
- [ ] **JwtTokenProvider.java** ⬅️ 우선순위 1️⃣
- [ ] **JwtAuthenticationFilter.java** ⬅️ 우선순위 1️⃣
- [ ] **User.java 업데이트** ⬅️ 우선순위 2️⃣
- [ ] **build.gradle 의존성** ⬅️ 우선순위 2️⃣
- [ ] **application.yml 설정** ⬅️ 우선순위 2️⃣

**예상 소요 시간**: 3-4일 (Claude Code 사용 시 1-2일)

---

## 📍 STEP 2: 프론트엔드 인증 통합 (2일) - ⏳ 대기 중

### Phase 5-2: 프론트엔드 토큰 관리

#### 필요한 것

**2-1: API 통신 유틸리티 (js/api.js 또는 utils/apiClient.js)**
```javascript
// 경로: frontend/js/api.js

기능:
  - createAuthHeader() → Object
    * Authorization: "Bearer {accessToken}" 생성
  
  - apiCall(url, options) → Promise
    * Authorization 헤더 자동 추가
    * 응답 상태 코드 확인
    * 401 오류 → refresh token 시도
    * 여전히 실패 → 로그인 페이지로 이동
  
  - refreshAccessToken() → Promise
    * /auth/refresh 호출
    * 새 토큰 localStorage 저장
  
  - logout() → void
    * /auth/logout 호출
    * localStorage에서 토큰 삭제
    * login.html로 이동

구현 방식:
  - fetch 사용
  - 모든 API 호출은 apiCall() 사용
```

**상태**: [ ] 구현 필요

---

**2-2: login.js 업데이트**
```javascript
// 경로: frontend/js/login.js

현재 상태:
  - [ ] 로그인 폼 제출 이벤트 처리
  - [ ] /auth/login API 호출
  - [ ] 응답에서 accessToken, refreshToken 추출
  - [ ] localStorage에 토큰 저장
  - [ ] 성공 시 closet.html로 이동

수정 필요:
  - apiCall() 사용 (위의 api.js에서 생성)
  - 에러 처리 개선
  - 토큰 저장 방식 표준화
  - 비밀번호 최소 길이 검증 (클라이언트)
  - 이메일 형식 검증 (클라이언트)

구현:
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
          const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
              localStorage.setItem('accessToken', data.accessToken);
              localStorage.setItem('refreshToken', data.refreshToken);
              localStorage.setItem('user', JSON.stringify(data.user));
              window.location.href = '/closet.html';
          } else {
              alert(data.message || '로그인 실패');
          }
      } catch (error) {
          console.error('로그인 오류:', error);
          alert('서버 연결 오류');
      }
  });
```

**상태**: [ ] 업데이트 필요

---

**2-3: signup.js 업데이트**
```javascript
// 경로: frontend/js/signup.js

현재 상태:
  - [ ] 회원가입 폼 제출 이벤트 처리
  - [ ] /auth/signup API 호출
  - [ ] 응답에서 토큰 추출
  - [ ] localStorage에 토큰 저장
  - [ ] 성공 시 closet.html로 이동

수정 필요:
  - 비밀번호 확인 필드 검증
  - 비밀번호 최소 길이 (8자 이상)
  - 이메일 형식 검증
  - 약관 동의 필드 (선택)
  - 에러 메시지 표시
  - 중복 이메일 에러 처리

구현:
  // 비밀번호 검증
  if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다');
      return;
  }
  
  if (password.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다');
      return;
  }
  
  // API 호출
  const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          email, password, username, phone: null
      })
  });
```

**상태**: [ ] 업데이트 필요

---

**2-4: script.js 또는 main.js (공통 초기화)**
```javascript
// 경로: frontend/js/script.js

기능:
  - 페이지 로드 시 토큰 유효성 검사
    * 토큰이 없으면 로그인 페이지로 이동
    * 토큰이 있으면 사용자 정보 로드
  
  - 로그아웃 버튼 이벤트
    * localStorage 토큰 삭제
    * API에 로그아웃 요청
    * login.html로 이동
  
  - 사용자 정보 표시
    * localStorage에서 user 정보 읽기
    * 화면에 사용자 이름 표시

구현:
  // 페이지 로드 시 실행
  document.addEventListener('DOMContentLoaded', () => {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      
      if (!accessToken) {
          window.location.href = '/login.html';
          return;
      }
      
      // 사용자 정보 표시
      if (user) {
          const userData = JSON.parse(user);
          console.log('로그인 사용자:', userData);
          // UI에 사용자 이름 표시
      }
  });
  
  // 로그아웃 버튼
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.clear();
      window.location.href = '/login.html';
  });
```

**상태**: [ ] 구현/업데이트 필요

---

### 🎯 STEP 2 완료 기준

- [ ] **api.js (API 유틸리티)** ⬅️ 우선순위 1️⃣
- [ ] **login.js 업데이트** ⬅️ 우선순위 1️⃣
- [ ] **signup.js 업데이트** ⬅️ 우선순위 1️⃣
- [ ] **script.js 업데이트** ⬅️ 우선순위 2️⃣

**예상 소요 시간**: 2일

---

## 📍 STEP 3: 고급 기능 (이미지 업로드 & 필터링) (5-7일) - ⏳ 예정

### Phase 6-1: 이미지 업로드 (S3 통합)

#### 필요한 것

**3-1: S3Service.java (또는 S3Util.java)**
```java
// 경로: backend/src/main/java/com/trion/ootd/service/S3Service.java

메서드:
  - uploadImage(MultipartFile file, String userId) → String
    * 파일 유효성 검사 (이미지 형식, 크기)
    * S3에 파일 업로드 (키: userId/timestamp/filename)
    * S3 URL 반환
  
  - deleteImage(String s3Url) → boolean
    * S3에서 이미지 삭제

의존성:
  - AmazonS3 s3Client (Spring Boot 자동 설정)
  - @Value("${aws.s3.bucket}") String bucketName

설정 (application.yml):
  aws:
    s3:
      bucket: ${AWS_S3_BUCKET:ootd-logic-bucket}
```

**상태**: [ ] 구현 필요

---

**3-2: ClothingController.java 업데이트 (이미지 업로드 엔드포인트)**
```java
// 경로: backend/src/main/java/com/trion/ootd/controller/ClothingController.java

추가 메서드:
  - @PostMapping("/upload")
    * 요청: MultipartFile image, String category, String color, String material
    * 처리: S3Service로 이미지 업로드
    * 처리: Clothing 엔티티 생성 및 저장
    * 응답: ClothingDTO (이미지 URL 포함)

예외 처리:
  - 파일이 비어있음 → 400 Bad Request
  - 이미지 형식이 아님 → 400 Bad Request
  - S3 업로드 실패 → 500 Internal Server Error
```

**상태**: [ ] 구현 필요

---

**3-3: ClothingRepository.java 업데이트 (필터링 쿼리)**
```java
// 경로: backend/src/main/java/com/trion/ootd/repository/ClothingRepository.java

추가 메서드:
  - findByUserIdAndCategory(String userId, String category) → List<Clothing>
    * 카테고리별 조회
  
  - findByUserIdAndColor(String userId, String color) → List<Clothing>
    * 색상별 조회
  
  - findByUserIdAndMaterial(String userId, String material) → List<Clothing>
    * 소재별 조회
  
  - findByUserIdAndCategoryAndColor(String userId, String category, String color) → List<Clothing>
    * 카테고리 & 색상 조회

구현:
  - DynamoDB Query 사용 (GSI 필요 가능)
  - Pagination 지원 (limit, offset)
```

**상태**: [ ] 구현 필요

---

**3-4: ClothingController.java 필터링 엔드포인트**
```java
// 경로: backend/src/main/java/com/trion/ootd/controller/ClothingController.java

추가 메서드:
  - @GetMapping("/filter")
    * 쿼리 파라미터: category, color, material (모두 선택)
    * 응답: List<ClothingDTO>

예:
  GET /api/clothing/filter?category=상의&color=검정
  GET /api/clothing/filter?color=흰색
```

**상태**: [ ] 구현 필요

---

### Phase 6-2: OOTD 로그 (코디 기록)

#### 필요한 것

**3-5: DailyLogController.java 구현**
```java
// 경로: backend/src/main/java/com/trion/ootd/controller/DailyLogController.java

엔드포인트:
  - @PostMapping("/save")
    * 요청: userId, clothingIds[], date, satisfaction (1-5)
    * 응답: DailyLogDTO

  - @GetMapping("/today")
    * 오늘 기록 조회
    * 응답: DailyLogDTO

  - @GetMapping("/month")
    * 쿼리: month (YYYY-MM)
    * 월별 기록 조회
    * 응답: List<DailyLogDTO>

  - @PatchMapping("/{logId}")
    * 만족도 업데이트
    * 요청: satisfaction (1-5)
```

**상태**: [ ] 구현 필요

---

**3-6: RecommendationService.java 고도화**
```java
// 경로: backend/src/main/java/com/trion/ootd/service/RecommendationService.java

메서드:
  - getRecommendationForToday(String userId) → RecommendationDTO
    * 오늘 추천이 이미 있는지 확인
    * 없으면 새로 생성 (Gemini API)
    * 있으면 기존 추천 반환

  - saveRecommendation(Recommendation) → void
    * DynamoDB에 저장

  - getRecommendationHistory(String userId, String month) → List<RecommendationDTO>
    * 월별 추천 이력 조회
```

**상태**: [ ] 구현 필요

---

### 🎯 STEP 3 완료 기준

- [ ] **S3Service.java** ⬅️ 우선순위 1️⃣
- [ ] **ClothingController.java 업데이트** ⬅️ 우선순위 1️⃣
- [ ] **ClothingRepository.java 업데이트** ⬅️ 우선순위 1️⃣
- [ ] **DailyLogController.java** ⬅️ 우선순위 2️⃣
- [ ] **RecommendationService.java** ⬅️ 우선순위 2️⃣

**예상 소요 시간**: 5-7일

---

## 📍 STEP 4: 테스트 & 배포 (3-5일) - ⏳ 예정

### Phase 7: 통합 테스트 및 배포

#### 필요한 것

**4-1: 통합 테스트**
- [ ] AuthServiceTest.java
- [ ] ClothingServiceTest.java
- [ ] IntegrationTest.java (API 엔드투엔드)

**4-2: 배포 준비**
- [ ] AWS Elastic Beanstalk 설정
- [ ] S3 + CloudFront 설정
- [ ] 환경 변수 관리 (.env)
- [ ] 로깅 및 모니터링 설정

**예상 소요 시간**: 3-5일

---

## 🗓️ 타임라인 (제안)

```
3월 31일 (월) - STEP 1 시작
├─ AuthService.java 구현 (4시간)
├─ JwtTokenProvider.java 구현 (3시간)
├─ JwtAuthenticationFilter.java 구현 (2시간)
└─ build.gradle & application.yml 업데이트 (1시간)

4월 1-2일 (화-수) - STEP 1 완료 & STEP 2 시작
├─ User.java 업데이트 (1시간)
├─ api.js 구현 (2시간)
├─ login.js, signup.js 업데이트 (3시간)
└─ script.js 업데이트 (1시간)

4월 3-5일 (목-토) - STEP 2 완료 & STEP 3 시작
├─ S3Service.java 구현 (3시간)
├─ ClothingController 업데이트 (2시간)
├─ ClothingRepository 업데이트 (2시간)
└─ 테스트 (2시간)

4월 6-10일 (일-목) - STEP 3 계속
├─ DailyLogController.java 구현 (2시간)
├─ RecommendationService 고도화 (3시간)
├─ 필터링 로직 최적화 (2시간)
└─ 통합 테스트 (3시간)

4월 11-14일 (금-월) - STEP 4 배포 준비
├─ 최종 테스트 (2시간)
├─ AWS 배포 설정 (3시간)
├─ 모니터링 설정 (1시간)
└─ 문서화 (1시간)

4월 15일 (화) - 발표 준비 완료 ✅
```

---

## 📊 우선순위 요약

### 🔴 **지금 바로 (3월 31일 - 4월 2일)**
1. AuthService.java ✅
2. JwtTokenProvider.java ✅
3. JwtAuthenticationFilter.java ✅
4. api.js (프론트) ✅
5. login.js, signup.js 업데이트 ✅

### 🟡 **곧 필요 (4월 3-5일)**
6. S3Service.java
7. ClothingController 이미지 업로드
8. User.java 업데이트
9. build.gradle 의존성

### 🟢 **나중에 필요 (4월 6-14일)**
10. DailyLogController
11. RecommendationService 고도화
12. 테스트 작성
13. AWS 배포

---

## 💾 Git 커밋 전략

### STEP 1 커밋
```bash
git add backend/src/main/java/com/trion/ootd/service/AuthService.java
git add backend/src/main/java/com/trion/ootd/util/JwtTokenProvider.java
git add backend/src/main/java/com/trion/ootd/config/JwtAuthenticationFilter.java
git add backend/src/main/java/com/trion/ootd/entity/User.java
git add backend/build.gradle
git add backend/src/main/resources/application.yml
git commit -m "feat: Implement JWT authentication with AuthService and JwtTokenProvider"
```

### STEP 2 커밋
```bash
git add frontend/js/api.js
git add frontend/js/login.js
git add frontend/js/signup.js
git add frontend/js/script.js
git commit -m "feat: Integrate JWT authentication in frontend"
```

### STEP 3 커밋
```bash
git add backend/src/main/java/com/trion/ootd/service/S3Service.java
git add backend/src/main/java/com/trion/ootd/controller/ClothingController.java
git add backend/src/main/resources/application.yml
git commit -m "feat: Add S3 image upload and clothing filter API"
```

---

## ✅ 최종 체크리스트

### STEP 1: 인증 기능 (예상 4일)
- [ ] AuthService.java 구현
- [ ] JwtTokenProvider.java 구현
- [ ] JwtAuthenticationFilter.java 구현
- [ ] User.java 비밀번호 필드 추가
- [ ] build.gradle JWT 의존성 확인
- [ ] application.yml JWT 설정 추가
- [ ] 컴파일 테스트 (`./gradlew clean build`)
- [ ] 로컬 테스트 (postman으로 /auth/signup, /auth/login 테스트)

### STEP 2: 프론트엔드 인증 (예상 2일)
- [ ] api.js 구현 (API 유틸리티)
- [ ] login.js 업데이트
- [ ] signup.js 업데이트
- [ ] script.js 업데이트
- [ ] localStorage 토큰 저장 확인
- [ ] 로그인/회원가입 테스트

### STEP 3: 고급 기능 (예상 5-7일)
- [ ] S3Service.java 구현
- [ ] ClothingController 이미지 업로드 엔드포인트
- [ ] ClothingRepository 필터링 쿼리
- [ ] DailyLogController 구현
- [ ] RecommendationService 고도화
- [ ] 통합 테스트

### STEP 4: 배포 & 최적화 (예상 3-5일)
- [ ] 보안 감시 (비밀번호 암호화, CORS 제한)
- [ ] 에러 처리 표준화
- [ ] 로깅 설정
- [ ] AWS 배포 준비
- [ ] 최종 문서화

---

**최종 목표 날짜**: 2026년 4월 15일 발표 준비 완료  
**현재 진행률**: 40% (25/62)  
**목표 진행률**: 100% (62/62)

---

**작성일**: 2026년 3월 31일  
**작성자**: 한비 (팀장)  
**마지막 업데이트**: 2026년 3월 31일