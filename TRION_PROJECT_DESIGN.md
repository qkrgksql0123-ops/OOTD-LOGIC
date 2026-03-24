# 🧥 Trion: OOTD-Logic 프로젝트 설계 문서

**프로젝트명**: Trion - OOTD-Logic (기온 및 개인 민감도 기반 지능형 의류 관리 플랫폼)
**팀명**: Trion (Three + On = 세 명이 함께 켜지는 프로젝트)
**역할**: 한비(백엔드팀장) · 최민우(프론트) · 주현빈(DB/알고리즘)
**생성일**: 2026.03.20

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처 설계](#아키텍처-설계)
3. [데이터베이스 스키마](#데이터베이스-스키마)
4. [API 설계](#api-설계)
5. [주요 기능 명세](#주요-기능-명세)
6. [개발 일정 및 마일스톤](#개발-일정-및-마일스톤)

---

## 프로젝트 개요

### 🎯 핵심 개념

사용자의 **실제 옷장 데이터**와 **실시간 환경 데이터**(기온, 미세먼지, 습도)를 AI(AWS Bedrock Titan)가 분석하여,
사용자의 체감 온도와 퍼스널 스타일을 반영한 **최적화된 코디를 자동 추천**하는 웹 서비스입니다.

### 📊 프로젝트 특징

| 항목 | 내용 |
|------|------|
| **핵심 가치** | 데이터 기반 의류 선택으로 아침 준비 시간 단축 및 스타일 최적화 |
| **AI 차별성** | Bedrock Titan이 사용자 착용 이력을 학습하여 개인화 추천 |
| **환경 고려** | 기상청 API + 에어코리아 API로 날씨와 공기질 실시간 반영 |
| **보조 기능** | Google Calendar 연동(일정 고려), Slack 알림(Lambda), Laundry-Sync(세탁 관리) |

---

## 아키텍처 설계

### 🏗️ 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React/HTML)                   │
│                    사용자 UI/Dashboard                       │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/REST API
┌────────────────▼────────────────────────────────────────────┐
│              Backend (Spring Boot 3.5 + Java 17)              │
├──────────────────────────────────────────────────────────────┤
│  Layer 1: Controller (REST API 엔드포인트)                    │
│  - UserController, ClothingController, RecommendationController │
│                                                               │
│  Layer 2: Service (비즈니스 로직)                            │
│  - ClothingService (옷장 관리)                              │
│  - RecommendationService (AI 추천)                          │
│  - EnvironmentService (환경데이터 처리)                     │
│  - GoogleCalendarService (일정 연동)                        │
│                                                               │
│  Layer 3: Repository (데이터 접근)                          │
│  - DynamoDbClothingRepository                              │
│  - DynamoDbUserRepository                                  │
│  - DynamoDbRecommendationRepository                        │
│                                                               │
│  Layer 4: Config & Integration                             │
│  - DynamoDbConfig (AWS SDK v2 설정)                        │
│  - BedrockConfig (AWS Bedrock Titan 설정)                 │
│  - AwsEventBridgeConfig (스케줄러 설정)                   │
│  - GoogleCalendarConfig (OAuth 2.0)                        │
└────────┬──────────────────────────┬──────────┬──────────────┘
         │                          │          │
    ┌────▼─────┐         ┌────────┴──┐  ┌───┴──────┐
    │ AWS SDK  │         │  AWS      │  │ Google   │
    │ DynamoDB │         │  Bedrock  │  │ Calendar │
    │          │         │  Titan    │  │ API      │
    └──────────┘         └───────────┘  └──────────┘

    ┌────────────────┐    ┌─────────────────┐    ┌──────────────┐
    │  EventBridge   │    │  Lambda + Slack │    │  기상청 API  │
    │  (주기 실행)    │    │   (푸시 알림)    │    │ 에어코리아 API│
    └────────────────┘    └─────────────────┘    └──────────────┘
```

### 📦 백엔드 모듈 구조

```
src/main/java/com/example/demo/
├── entity/
│   ├── User.java                  # 사용자 정보 (PK: userId)
│   ├── Clothing.java              # 의류 정보 (PK: userId+clothingId)
│   ├── DailyLog.java              # 착용 이력 (PK: userId+logDate)
│   ├── EnvironmentData.java       # 환경데이터 (PK: date+region)
│   ├── Recommendation.java        # AI 추천 결과 (PK: userId+recommendDate)
│   └── LaundrySync.java           # 세탁 상태 (PK: userId+clothingId)
│
├── repository/
│   ├── ClothingRepository.java
│   ├── DynamoDbClothingRepository.java
│   ├── UserRepository.java
│   ├── DailyLogRepository.java
│   ├── EnvironmentDataRepository.java
│   └── RecommendationRepository.java
│
├── service/
│   ├── UserService.java           # 회원 관리
│   ├── ClothingService.java       # 옷장 CRUD
│   ├── RecommendationService.java # AI 추천 로직
│   ├── EnvironmentService.java    # 환경데이터 수집/처리
│   ├── GoogleCalendarService.java # 캘린더 연동
│   ├── BedrockService.java        # AI 모델 호출
│   └── LaundrySyncService.java    # 세탁 관리
│
├── controller/
│   ├── UserController.java
│   ├── ClothingController.java
│   ├── RecommendationController.java
│   └── EnvironmentController.java
│
├── config/
│   ├── DynamoDbConfig.java        # DynamoDB 설정
│   ├── BedrockConfig.java         # Bedrock Titan 설정
│   ├── GoogleCalendarConfig.java  # Google OAuth
│   ├── SlackConfig.java           # Slack Webhook
│   └── EventBridgeConfig.java     # AWS EventBridge 설정
│
├── dto/
│   ├── ClothingDTO.java
│   ├── UserDTO.java
│   ├── RecommendationDTO.java
│   ├── EnvironmentDTO.java
│   └── DailyLogDTO.java
│
├── exception/
│   └── CustomException.java
│
├── util/
│   ├── ImageAnalyzer.java        # Bedrock을 이용한 이미지 분석
│   ├── WeatherParser.java        # 기상청 API 파싱
│   ├── AirQualityParser.java     # 에어코리아 API 파싱
│   └── TempCalculator.java       # 체감온도 계산 로직
│
└── Application.java
```

---

## 데이터베이스 스키마

### DynamoDB 테이블 설계 (DynamoDB는 NoSQL이므로 유연한 구조)

#### 1️⃣ **User 테이블**
```yaml
테이블명: User
PK: userId (String, Partition Key)
속성:
  - userId: 사용자 고유 ID (예: user_12345)
  - email: 이메일
  - nickname: 닉네임
  - tempSensitivity: 온도 민감도 설정 (1~10 스케일)
    * 1: 매우 추움 감수
    * 10: 매우 더움 감수
  - skinTone: 피부톤 ('warm', 'cool', 'neutral')
  - faceShape: 얼굴형 (Bedrock AI 분석 결과 저장)
  - createdAt: 가입일
  - updatedAt: 마지막 수정일
  - slackUserId: Slack 워크스페이스 ID (알림용)
  - googleCalendarToken: Google Calendar OAuth 토큰 (암호화)
```

#### 2️⃣ **Clothing 테이블** (이미 작성됨)
```yaml
테이블명: Clothing
PK: userId (String, Partition Key) + id (String, Sort Key)
속성:
  - id: 의류 고유 ID (예: cloth_uuid)
  - userId: 사용자 ID
  - category: 의류 카테고리 ('top', 'bottom', 'outer', 'shoes', 'accessory')
  - subcategory: 세부 카테고리 ('tshirt', 'shirt', 'knit' 등)
  - imageUrl: S3에 저장된 의류 사진 URL
  - color: 색상 (Bedrock 이미지 분석으로 추출)
  - material: 소재 ('cotton', 'wool', 'synthetic' 등)
  - season: 계절성 ('spring', 'summer', 'fall', 'winter', 'allseason')
  - thickness: 두께 (Bedrock 분석 결과, 1~5 레벨)
  - tags: ['캐주얼', '포멀', '스포츠', '보온성높음' 등]
  - createdAt: 등록일
  - isInLaundry: 세탁 중 여부 (boolean)
  - lastWornDate: 마지막 착용일
  - wearCount: 착용 횟수
```

#### 3️⃣ **DailyLog 테이블** (사용자 착용 이력)
```yaml
테이블명: DailyLog
PK: userId (Partition Key) + logDate (Sort Key, 날짜 YYYY-MM-DD)
속성:
  - userId: 사용자 ID
  - logDate: 날짜
  - outwearClothingId: 외투 ID
  - topClothingId: 상의 ID
  - bottomClothingId: 하의 ID
  - shoeClothingId: 신발 ID
  - accessories: [accessory ID 배열]
  - temperature: 해당 날의 기온
  - humidity: 습도
  - uvIndex: 자외선 지수
  - microDust: 미세먼지 (PM10)
  - fineDust: 초미세먼지 (PM2.5)
  - windSpeed: 풍속
  - weatherCondition: 날씨 ('晴', '雨', 'Snow' 등)
  - scheduledEvents: 그날의 Google Calendar 일정 목록
  - userComfort: 사용자가 남긴 착용감 평가 (1~5)
  - feedback: 피드백 텍스트
  - createdAt: 기록 생성일
```

#### 4️⃣ **EnvironmentData 테이블** (공공데이터 캐시)
```yaml
테이블명: EnvironmentData
PK: region (Partition Key, 지역명) + dataDate (Sort Key, 날짜)
속성:
  - region: 지역 ('서울', '부산' 등)
  - dataDate: 날짜 (YYYY-MM-DD)
  - temperature: 기온
  - minTemp: 최저기온
  - maxTemp: 최고기온
  - humidity: 습도
  - windSpeed: 풍속
  - precipitation: 강수량
  - uvIndex: 자외선 지수
  - pm10: 미세먼지
  - pm25: 초미세먼지
  - weatherCondition: 날씨 상태
  - skyCondition: 하늘 상태
  - fetchedAt: 데이터 수집 시간
  - ttl: TTL (자동 삭제, 예: 30일)
```

#### 5️⃣ **Recommendation 테이블** (AI 추천 결과)
```yaml
테이블명: Recommendation
PK: userId (Partition Key) + recommendDate (Sort Key)
속성:
  - userId: 사용자 ID
  - recommendDate: 추천 생성일 (YYYY-MM-DD)
  - recommendedOutfits: [
      {
        rank: 1,
        outwearId: '...',
        topId: '...',
        bottomId: '...',
        shoeId: '...',
        confidence: 0.95,  # AI 확신도
        reason: '따뜻한 외투로 오늘 추위 대비 가능'
      },
      ...
    ]
  - temperature: 추천 당시 기온
  - weatherWarning: 날씨 주의사항 ('미세먼지 높음', '강풍' 등)
  - upcomingSchedules: 그날 예정된 일정들 (캘린더에서 추출)
  - generatedByModel: 'bedrock-titan'
  - modelVersion: 'v1.0'
```

#### 6️⃣ **LaundrySync 테이블** (세탁 상태 관리)
```yaml
테이블명: LaundrySync
PK: userId (Partition Key) + clothingId (Sort Key)
속성:
  - userId: 사용자 ID
  - clothingId: 의류 ID
  - status: 상태 ('available', 'in_laundry', 'needs_wash')
  - lastWashedDate: 마지막 세탁일
  - recommendedWashCycle: 세탁 권장 주기 (일 단위, 예: 7)
  - nextWashDate: 다음 세탁 예정일
  - wearCountSinceWash: 세탁 이후 착용 횟수
  - updatedAt: 마지막 업데이트
  - notificationSent: 알림 발송 여부
```

---

## API 설계

### 📌 REST API 엔드포인트

#### **인증 & 사용자 관리**

```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "hashed_pwd",
  "nickname": "styleSeeker"
}

Response:
{
  "userId": "user_12345",
  "accessToken": "jwt_token",
  "refreshToken": "refresh_jwt"
}
```

```http
POST /api/v1/auth/login
POST /api/v1/auth/refresh
DELETE /api/v1/auth/logout

PUT /api/v1/users/{userId}/settings
Content-Type: application/json

{
  "tempSensitivity": 5,
  "skinTone": "cool",
  "slackUserId": "U123456",
  "googleCalendarToken": "encrypted_token"
}
```

#### **옷장 관리 (Clothing)**

```http
# 의류 등록 (이미지 포함)
POST /api/v1/users/{userId}/clothing
Content-Type: multipart/form-data

{
  "image": [binary_image_file],
  "category": "top",
  "tags": ["casual", "summer"]
}

Response:
{
  "id": "cloth_uuid",
  "category": "top",
  "color": "blue",      # Bedrock 분석 결과
  "material": "cotton", # Bedrock 분석 결과
  "season": "allseason",
  "thickness": 2,
  "imageUrl": "https://s3.amazonaws.com/..."
}

# 의류 목록 조회
GET /api/v1/users/{userId}/clothing?category=top&season=summer
GET /api/v1/users/{userId}/clothing/{clothingId}
PUT /api/v1/users/{userId}/clothing/{clothingId}
DELETE /api/v1/users/{userId}/clothing/{clothingId}
```

#### **착용 이력 (DailyLog)**

```http
# 착용 이력 기록
POST /api/v1/users/{userId}/daily-logs
Content-Type: application/json

{
  "logDate": "2026-03-20",
  "outwearClothingId": "cloth_1",
  "topClothingId": "cloth_2",
  "bottomClothingId": "cloth_3",
  "shoeClothingId": "cloth_4",
  "accessories": ["cloth_5"],
  "userComfort": 4,
  "feedback": "따뜻하고 편했어요!"
}

# 착용 이력 조회
GET /api/v1/users/{userId}/daily-logs?from=2026-03-01&to=2026-03-31
GET /api/v1/users/{userId}/daily-logs/{logDate}
```

#### **AI 추천 (Recommendation)** ⭐

```http
# 오늘 OOTD 추천 받기 (Bedrock Titan AI)
GET /api/v1/users/{userId}/recommendation/today
Query Params:
  - region: "서울" (선택, 환경데이터 특정 지역)
  - includeCalendar: true (Google Calendar 일정 고려)
  - confidence: 0.8 (최소 신뢰도)

Response:
{
  "recommendDate": "2026-03-20",
  "temperature": 12,
  "weatherCondition": "맑음",
  "weatherWarning": "자외선 지수 높음",
  "recommendedOutfits": [
    {
      "rank": 1,
      "items": {
        "outwear": {
          "id": "cloth_1",
          "name": "경량 패딩",
          "color": "black",
          "imageUrl": "..."
        },
        "top": {
          "id": "cloth_2",
          "name": "화이트 셔츠",
          "color": "white"
        },
        "bottom": {
          "id": "cloth_3",
          "name": "데님 팬츠",
          "color": "blue"
        },
        "shoes": {
          "id": "cloth_4",
          "name": "스니커",
          "color": "white"
        }
      },
      "confidence": 0.95,
      "reason": "쌀쌀한 날씨에 따뜻한 외투로 레이어링 추천. 오전 업무 회의가 있으니 캐주얼 포멀 느낌으로 구성",
      "styleScore": 85
    }
  ],
  "upcomingSchedules": [
    {
      "time": "10:00",
      "title": "팀 회의",
      "type": "business"
    }
  ]
}

# 추천 결과 평가 (피드백)
POST /api/v1/users/{userId}/recommendation/{recommendDate}/feedback
Content-Type: application/json

{
  "helpful": true,
  "rating": 5,
  "comment": "정확한 추천이었어요!"
}
```

#### **환경 데이터 (Environment)**

```http
# 현재 지역의 환경데이터 조회
GET /api/v1/environment/current?region=서울

Response:
{
  "region": "서울",
  "temperature": 12,
  "minTemp": 8,
  "maxTemp": 15,
  "humidity": 45,
  "windSpeed": 3.5,
  "precipitation": 0,
  "uvIndex": 5,
  "pm10": 35,
  "pm25": 18,
  "weatherCondition": "맑음"
}

# 예보 조회 (내일, 주간)
GET /api/v1/environment/forecast?region=서울&days=7
```

#### **세탁 관리 (LaundrySync)**

```http
# 의류를 세탁함으로 이동
POST /api/v1/users/{userId}/laundry-sync/{clothingId}/mark-washing
Response: { "status": "in_laundry" }

# 세탁 완료 표시
POST /api/v1/users/{userId}/laundry-sync/{clothingId}/wash-completed
Response: { "status": "available", "nextWashDate": "2026-03-27" }

# 세탁 상태 조회
GET /api/v1/users/{userId}/laundry-sync
GET /api/v1/users/{userId}/laundry-sync/{clothingId}

# 세탁 알림 (사용자가 수동으로 확인)
GET /api/v1/users/{userId}/laundry-sync/reminders
Response: [
  {
    "clothingId": "cloth_1",
    "name": "즐겨 입는 흰 셔츠",
    "daysUntilWash": 2,
    "wearCountSinceWash": 6
  }
]
```

---

## 주요 기능 명세

### ✨ Feature 1: Virtual Closet (디지털 옷장)

**개요**: 사용자의 모든 의류를 디지털화하여 관리

**프로세스**:
1. 사용자가 옷 사진을 업로드
2. Bedrock Titan이 이미지 분석
   - 색상 추출
   - 소재 판단 (cotton, wool, synthetic 등)
   - 의류 종류 분류
   - 계절성 판단
   - 두께/보온성 평가 (1~5)
3. 메타데이터와 함께 DynamoDB에 저장
4. 사용자가 조회/수정/삭제

**구현 서비스**:
```java
// ClothingService.java
public ClothingDTO uploadClothing(String userId, MultipartFile image, ClothingRequestDTO request)
public List<ClothingDTO> getClothingByCategory(String userId, String category)
public List<ClothingDTO> searchClothing(String userId, ClothingSearchCriteria criteria)
public void deleteClothing(String userId, String clothingId)
```

---

### ✨ Feature 2: Temp-Logic & AI Recommendation (온도 기반 지능 추천)

**개요**: 실시간 환경 데이터 + 사용자 체감온도 + AI 학습으로 최적의 옷조합 제안

**핵심 알고리즘**:

```
1. 입력 수집
   - 실시간 기온, 습도, 풍속 (기상청 API)
   - 미세먼지, 자외선 (에어코리아 API)
   - 사용자의 온도 민감도 설정 (1~10)
   - Google Calendar 일정 정보
   - 사용자의 과거 착용 이력

2. Bedrock Titan AI 분석
   - "사용자가 온도 민감도 5, 기온 12도, 습도 45%, 오전 회의 예정"
   - 사용자의 과거 착용 패턴 학습
   - 피부톤(cool/warm), 얼굴형 고려
   - 최상의 코디 3~5개 생성 (신뢰도 점수 포함)

3. 순위 정렬
   - 신뢰도 높은 순
   - 스타일 점수 높은 순

4. 추천 반환
   - 각 추천에 "왜 이 옷을 추천했는가"라는 설명 포함
```

**구현**:
```java
// RecommendationService.java
public RecommendationDTO getTodayRecommendation(String userId, String region, boolean includeCalendar)
  → EnvironmentService.fetchCurrentWeather(region)
  → GoogleCalendarService.getUpcomingSchedules(userId)
  → DailyLogRepository.getRecentWearHistory(userId, 30)  // 최근 30일 데이터
  → BedrockService.generateOutfitCombinations(...)
  → 상위 N개 필터링 후 반환

// BedrockService.java (핵심)
public List<OutfitCombination> analyzeAndRecommend(
  User user,
  EnvironmentData environment,
  List<DailyLog> wearHistory,
  List<ClothingDTO> availableClothes,
  List<Calendar.Event> schedules
)
  // Bedrock Titan Prompt 생성
  // "사용자 프로필: 온도민감도=5, 피부톤=cool, 얼굴형=oval
  //  오늘 날씨: 기온 12도, 습도 45%, 미세먼지 35
  //  예정: 오전 회의(업무), 오후 카페(친구)
  //  사용자 최근 선호: 캐주얼, 밝은 색상, 데님 많이 입음
  //  사용자 옷장: [옷 목록]
  //  최적의 3가지 코디를 추천하고 각각의 이유를 설명해줘"
```

---

### ✨ Feature 3: Laundry-Sync (세탁 자동 추적)

**개요**: 사용자가 입은 옷을 자동으로 추적하고 세탁 필요 여부 알림

**프로세스**:
1. 사용자가 Daily Log에 입은 옷 기록
2. 해당 의류의 `wearCountSinceWash` 증가
3. 세탁 권장 주기(예: 7일) 도달 시 알림 (Slack + 이메일)
4. 사용자가 세탁 시작 → 상태를 `in_laundry`로 변경
5. 세탁 완료 → 상태를 `available`로 변경, 카운트 리셋

**구현**:
```java
// LaundrySyncService.java
public void recordWear(String userId, List<String> clothingIds, String logDate)
  → 각 의류의 wearCountSinceWash 증가
  → checkWashNecessity() 호출

public void checkWashNecessity(String userId)
  → LaundrySync 테이블에서 모든 의류 조회
  → wearCountSinceWash >= recommendedWashCycle 확인
  → Slack 알림 발송 (Lambda 트리거)
  → nextWashDate 계산

public void markAsWashing(String userId, String clothingId)
  → status = 'in_laundry'
  → 추천 API에서 해당 옷 제외

public void washCompleted(String userId, String clothingId)
  → status = 'available'
  → wearCountSinceWash = 0
  → lastWashedDate = today
```

---

### ✨ Feature 4: Google Calendar Integration (일정 고려 추천)

**개요**: 그날의 일정(회의, 약속, 운동 등)을 고려하여 더 정확한 추천

**프로세스**:
1. OAuth 2.0으로 Google Calendar 접근 권한 받기
2. 사용자의 Calendar에서 오늘 일정 조회
3. 각 일정의 타입 분류 (business, casual, sports, date 등)
4. Bedrock에 전달: "오전 10시 회의(업무), 오후 카페(친구)"
5. AI가 상황에 맞는 옷 조합 추천

**구현**:
```java
// GoogleCalendarService.java
public List<CalendarEvent> getTodaySchedules(String userId)
  → Google Calendar API 호출
  → 오늘 일정 조회
  → 각 일정의 타입 분류

// CalendarEvent 예시
{
  "time": "10:00",
  "title": "팀 회의",
  "type": "business",
  "duration": 60,
  "location": "회의실"
}
```

---

### ✨ Feature 5: Slack Integration + Lambda (실시간 알림)

**개요**: 세탁 필요 알림, 추천 요청, 우산 준비 등을 Slack 메시지로 즉시 발송

**프로세스**:
1. 이벤트 발생 (세탁 필요, 내일 날씨 나쁨 등)
2. Lambda 함수 트리거
3. Slack Webhook으로 메시지 발송
4. 사용자가 Slack 메시지에서 "오늘 추천받기" 버튼 클릭 가능

**구현**:
```java
// SlackService.java
public void sendWashReminder(String slackUserId, List<ClothingDTO> needsWash)
  → Lambda 호출
  → Slack Webhook POST
  // 메시지 예시:
  // "👕 세탁 알림!
  //  화이트 셔츠(6회 착용), 검은 팬츠(5회)가 세탁이 필요해요.
  //  [오늘 추천 받기] 버튼"

public void sendWeatherWarning(String slackUserId, String warning)
  // "⚠️ 내일 미세먼지가 높으니 마스크 준비하세요!"
```

**Lambda 함수** (`lambda_slack_notifier.py`):
```python
import json
import boto3
import requests

def lambda_handler(event, context):
    slack_webhook = os.environ['SLACK_WEBHOOK_URL']
    message = event['message']  # Backend에서 전달

    response = requests.post(slack_webhook, json={"text": message})

    return {
        "statusCode": 200,
        "body": json.dumps("Slack message sent!")
    }
```

---

### ✨ Feature 6: Environment Data Collection (EventBridge 자동화)

**개요**: 매일 일정 시간마다 환경데이터를 자동으로 수집하고 저장

**프로세스**:
1. EventBridge 스케줄러 설정 (예: 매일 오전 6시, 12시, 18시)
2. 각 시간마다 Lambda 함수 트리거
3. 기상청 API, 에어코리아 API 호출
4. 데이터 파싱 후 DynamoDB에 저장
5. TTL 설정으로 오래된 데이터 자동 삭제 (30일)

**구현**:
```yaml
# EventBridge 규칙
Rule Name: FetchEnvironmentData
Schedule: cron(0 6,12,18 * * ? *)  # 06:00, 12:00, 18:00 UTC
Target: Lambda Function → EnvironmentDataCollector

# Lambda 함수 (Python)
def lambda_handler(event, context):
    regions = ['서울', '부산', '인천', '대구', '광주']

    for region in regions:
        weather = fetch_weather_api(region)
        air_quality = fetch_air_quality_api(region)

        save_to_dynamodb(
            table='EnvironmentData',
            region=region,
            dataDate=today,
            temperature=weather['temp'],
            pm10=air_quality['pm10'],
            ...
        )
```

---

## 개발 일정 및 마일스톤

### 📅 전체 타임라인 (약 8주)

| 주차 | 마일스톤 | 담당 | 상태 |
|------|---------|------|------|
| **1-2주** | STEP 1-3 (환경 설정, 엔티티, 기본 Config) | 한비 | 🟢 진행중 |
| **3주** | AI 서비스 연동 (Bedrock Titan, 이미지 분석) | 한비 | 🔴 예정 |
| **4주** | 환경 데이터 수집 (EventBridge, API) | 한비 | 🔴 예정 |
| **5주** | Google Calendar + Slack 통합 | 한비 | 🔴 예정 |
| **6주** | 프론트엔드 UI/대시보드 (React) | 최민우 | 🔴 예정 |
| **7주** | 테스트 및 최적화 | 전원 | 🔴 예정 |
| **8주** | AWS 배포 (EC2 또는 Elastic Beanstalk) | 한비 | 🔴 예정 |

### 🎯 STEP별 세부 일정

#### **STEP 1: 기본 설정 & 빌드** (1-2주)
- ✅ DynamoDB 의존성 추가
- ✅ application.yml 설정
- ✅ DynamoDB Config 작성
- 📝 Clothing, User 엔티티 작성
- 📝 Repository 인터페이스 작성

#### **STEP 2: AWS 연결** (진행중)
- 📝 AWS CLI 설치 & aws configure
- 📝 DynamoDB 테이블 생성 (AWS 콘솔 또는 CloudFormation)
- 📝 테스트: 간단한 CRUD 작업

#### **STEP 3: Bedrock AI 연동** (3주차)
- 📝 AWS Bedrock 서비스 활성화
- 📝 Titan 모델 액세스 신청
- 📝 BedrockService 구현
- 📝 이미지 분석 로직 구현
- 📝 Prompt Engineering 및 테스트

#### **STEP 4: 환경 데이터** (4주차)
- 📝 기상청 API 키 발급
- 📝 에어코리아 API 키 발급
- 📝 EnvironmentService 구현
- 📝 EventBridge 스케줄 설정
- 📝 Lambda 함수 작성

#### **STEP 5: Slack 연동** (5주차)
- 📝 Slack 워크스페이스 생성
- 📝 Slack Webhook 설정
- 📝 Lambda 함수 작성 (Slack 발송)
- 📝 알림 메시지 템플릿 작성

#### **STEP 6: Google Calendar** (5주차)
- 📝 Google Cloud Console 설정
- 📝 OAuth 2.0 인증 구현
- 📝 GoogleCalendarService 구현
- 📝 일정 조회 및 추천 연동

#### **STEP 7: 프론트엔드** (6주차)
- 최민우: React 대시보드 개발
- 데이터 시각화 (Chart.js)
- 반응형 UI

#### **STEP 8: 통합 테스트 & 배포** (7-8주차)
- 📝 단위 테스트 작성
- 📝 통합 테스트
- 📝 성능 최적화
- 📝 AWS 배포 (Elastic Beanstalk 또는 EC2)

---

## 📌 기술 결정 사항 (교수님 피드백 반영)

| 항목 | 결정 | 이유 |
|------|------|------|
| **AI 모델** | AWS Bedrock Titan | Gemini보다 성능 우수, AWS 통합 |
| **데이터베이스** | AWS DynamoDB | MySQL 대신, 확장성과 비용 효율성 |
| **환경 데이터** | EventBridge + Lambda | 자동화 및 비용 효율적 |
| **알림** | Slack + Lambda | 실시간 알림, 통합 용이 |
| **일정 연동** | Google Calendar API | 사용자 일정 반영 추천 |
| **배포** | EC2 또는 Elastic Beanstalk | 자동 스케일링 및 관리 용이 |
| **버전 관리** | GitHub | 팀 협업 및 CICD 구축 |

---

## 📝 주의 사항 & 보안

1. **API 키 관리**: `.gitignore`에 `application.yml` 포함, AWS Secrets Manager 사용
2. **Google OAuth 토큰**: 암호화하여 저장
3. **사용자 이미지**: S3에 저장, 접근 제어 설정
4. **Rate Limiting**: Bedrock API 호출 제한 설정
5. **데이터 프라이버시**: GDPR 고려, 사용자 데이터 암호화

---

## 🚀 다음 단계

1. **이 문서 리뷰** → 팀원과 함께 검토 및 피드백
2. **Git 저장소 생성** → GitHub에 프로젝트 생성
3. **AWS 설정** → IAM 사용자, DynamoDB 테이블 생성
4. **개발 시작** → STEP 1부터 순차적으로 진행

---

**작성자**: 한비 (백엔드 팀장)
**마지막 수정**: 2026.03.20
