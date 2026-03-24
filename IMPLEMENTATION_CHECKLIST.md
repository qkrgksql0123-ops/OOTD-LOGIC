# 🧥 Trion 프로젝트 - 구현 체크리스트

**생성일**: 2026.03.20
**담당**: 백엔드 팀장 (한비)
**상태**: 🟢 Phase 1 - 환경 설정 진행 중

---

## ✅ 완료된 작업

### Phase 0: 프로젝트 기초 설정
- [x] **build.gradle** - AWS SDK v2 DynamoDB 의존성 추가
- [x] **application.yml** - AWS 설정 파일 생성
- [x] **DynamoDbConfig.java** - DynamoDB 클라이언트 설정
- [x] **TRION_PROJECT_DESIGN.md** - 프로젝트 설계 문서 작성

### Phase 1: 엔티티 & Repository 작성
- [x] **Clothing.java** - 의류 정보 엔티티
- [x] **User.java** - 사용자 정보 엔티티
- [x] **DailyLog.java** - 착용 이력 엔티티
- [x] **EnvironmentData.java** - 환경 데이터 엔티티
- [x] **LaundrySync.java** - 세탁 상태 관리 엔티티
- [x] **Recommendation.java** - AI 추천 결과 엔티티
- [x] **ClothingRepository.java** - 인터페이스
- [x] **DynamoDbClothingRepository.java** - 구현체
- [x] **UserRepository.java** - 사용자 리포지토리 인터페이스
- [x] **DailyLogRepository.java** - 착용이력 리포지토리 인터페이스
- [x] **RecommendationRepository.java** - 추천 리포지토리 인터페이스
- [x] **ClothingDTO.java** - 의류 DTO
- [x] **BedrockConfig.java** - Bedrock AI 클라이언트 설정

---

## 🔄 진행 중 (STEP 2-3)

### STEP 2: AWS 연결 & DynamoDB 테이블 생성
```
현재 상태: ⏳ 대기 중

필요한 작업:
- [ ] AWS CLI 설치
  $ aws --version

- [ ] AWS 자격증명 설정
  $ aws configure
  (교수님께 Access Key ID, Secret Access Key 받기)

- [ ] DynamoDB 테이블 생성 (AWS 콘솔 또는 CLI)
  테이블명: User
    PK: userId (String)

  테이블명: Clothing
    PK: userId (String)
    SK: id (String)

  테이블명: DailyLog
    PK: userId (String)
    SK: logDate (String)

  테이블명: EnvironmentData
    PK: region (String)
    SK: dataDate (String)
    TTL: ttl (Unix Timestamp)

  테이블명: Recommendation
    PK: userId (String)
    SK: recommendDate (String)

  테이블명: LaundrySync
    PK: userId (String)
    SK: clothingId (String)
```

### STEP 3: Bedrock AI 연동 준비
```
현재 상태: ⏳ 대기 중

필요한 작업:
- [ ] AWS Bedrock 서비스 활성화 (AWS 콘솔)
  https://console.aws.amazon.com/bedrock

- [ ] Titan 모델 액세스 신청
  모델명: amazon.titan-text-express-v1
  또는: amazon.titan-text-premier-v1

- [ ] AWS SDK for Java Bedrock 의존성 추가 예정
```

---

## 📝 STEP 4-9: 향후 계획

### STEP 4: 이미지 분석 & 추천 서비스
```
[ ] BedrockService.java 작성
    - 이미지 분석 (색상, 소재, 카테고리)
    - 사용자 스타일 학습
    - OOTD 추천 생성

[ ] ImageAnalyzer.java 작성
[ ] TempCalculator.java 작성 (체감온도)
```

### STEP 5: 환경 데이터 수집
```
[ ] EnvironmentService.java 작성
[ ] WeatherParser.java (기상청 API)
[ ] AirQualityParser.java (에어코리아 API)
[ ] EventBridge 스케줄러 설정
[ ] Lambda 함수 작성 (데이터 수집)
```

### STEP 6: Google Calendar 연동
```
[ ] GoogleCalendarService.java 작성
[ ] GoogleCalendarConfig.java 작성
[ ] OAuth 2.0 인증 로직
```

### STEP 7: Slack 통합
```
[ ] SlackService.java 작성
[ ] SlackConfig.java 작성
[ ] Lambda 함수 작성 (메시지 발송)
```

### STEP 8: 컨트롤러 & API 엔드포인트
```
[ ] UserController.java
[ ] ClothingController.java
[ ] RecommendationController.java
[ ] DailyLogController.java
[ ] EnvironmentController.java
```

### STEP 9: 테스트 & 배포
```
[ ] 단위 테스트 작성
[ ] 통합 테스트
[ ] 성능 최적화
[ ] AWS 배포 (EC2 또는 Elastic Beanstalk)
[ ] GitHub 저장소 최종 정리
```

---

## 📦 현재 프로젝트 구조

```
src/main/java/com/example/demo/
├── entity/
│   ├── User.java ✅
│   ├── Clothing.java ✅
│   ├── DailyLog.java ✅
│   ├── EnvironmentData.java ✅
│   ├── LaundrySync.java ✅
│   └── Recommendation.java ✅
├── repository/
│   ├── ClothingRepository.java ✅
│   ├── DynamoDbClothingRepository.java ✅
│   ├── UserRepository.java ✅
│   ├── DailyLogRepository.java ✅
│   ├── RecommendationRepository.java ✅
│   └── DynamoDbUserRepository.java 📝
├── service/
│   ├── BedrockService.java 📝
│   ├── EnvironmentService.java 📝
│   ├── ClothingService.java 📝
│   ├── RecommendationService.java 📝
│   ├── GoogleCalendarService.java 📝
│   ├── SlackService.java 📝
│   └── LaundrySyncService.java 📝
├── controller/
│   ├── UserController.java 📝
│   ├── ClothingController.java 📝
│   ├── RecommendationController.java 📝
│   └── EnvironmentController.java 📝
├── config/
│   ├── DynamoDbConfig.java ✅
│   ├── BedrockConfig.java ✅
│   ├── GoogleCalendarConfig.java 📝
│   └── SlackConfig.java 📝
├── dto/
│   ├── ClothingDTO.java ✅
│   ├── UserDTO.java 📝
│   ├── RecommendationDTO.java 📝
│   └── EnvironmentDTO.java 📝
├── util/
│   ├── ImageAnalyzer.java 📝
│   ├── WeatherParser.java 📝
│   ├── AirQualityParser.java 📝
│   └── TempCalculator.java 📝
└── Application.java ✅

✅ = 완료
📝 = 작성 대기 중
```

---

## 🚀 다음 단계 (즉시 실행 필요)

### 1️⃣ AWS 계정 설정
```bash
# AWS CLI 설치 확인
aws --version

# 자격증명 설정 (교수님께 받은 Access Key 사용)
aws configure
  AWS Access Key ID: [교수님께서 제공]
  AWS Secret Access Key: [교수님께서 제공]
  Default region name: ap-northeast-2
  Default output format: json
```

### 2️⃣ DynamoDB 테이블 생성
```bash
# Option A: AWS 콘솔에서 수동 생성
# https://console.aws.amazon.com/dynamodbv2/

# Option B: CLI를 이용한 자동화 생성
# create_tables.sh 파일 작성 예정
```

### 3️⃣ 프로젝트 빌드 테스트
```bash
cd C:\workspace\demo\demo
./gradlew clean build
```

### 4️⃣ Git 저장소 초기화
```bash
git init
git add .
git commit -m "Trion OOTD-Logic - Initial setup with entities and configs"
git remote add origin [GitHub 저장소 URL]
git push -u origin main
```

---

## 🎯 팀원별 역할 분담

| 담당 | 역할 | 진행 상황 |
|------|------|---------|
| **한비 (팀장)** | 백엔드: Bedrock AI, 환경데이터, 전체 아키텍처 | 🟢 Phase 1 진행 |
| **최민우** | 프론트: React 대시보드, UI/UX | ⏳ 백엔드 완성 대기 |
| **주현빈** | DB 모델링, 세탁 알고리즘, 추천 로직 | ⏳ 의존성 대기 |

---

## 📌 주의사항

1. **API 키 보안**: `application.yml`은 `.gitignore`에 포함시킬 것
2. **AWS 비용**: 교수님 계정 사용, 불필요한 리소스는 삭제
3. **DynamoDB TTL**: EnvironmentData는 30일 후 자동 삭제되도록 설정
4. **Bedrock 토큰**: 프롬프트 길이 제한 확인 (Titan Express: 8K tokens)
5. **GitHub 협업**: 브랜치 전략 수립 (main / dev / feature/*)

---

## 📞 리소스 & 참고자료

- [AWS SDK for Java v2 DynamoDB](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/java-dyn-intro.html)
- [AWS Bedrock API Reference](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)
- [Spring Boot 3.5 + AWS 통합](https://spring.io/projects/spring-cloud-aws)
- [Google Calendar API](https://developers.google.com/calendar)
- [Slack API](https://api.slack.com/)

---

**마지막 업데이트**: 2026.03.20
**다음 리뷰**: 2026.03.27 (1주일 후)
