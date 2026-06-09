# OOTD-Logic 시스템 정리

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | OOTD-Logic (옷차림 추천 앱) |
| 팀명 | Team TRION |
| 서버 주소 | http://54.116.165.249:8095 |
| 배포 브랜치 | hanbi |

---

## 2. 기술 스택

| 구분 | 기술 |
|------|------|
| 백엔드 | Spring Boot 3.3 (Java 17) |
| 프론트엔드 | HTML / CSS / JavaScript (Spring Boot static 폴더 서빙) |
| 데이터베이스 | AWS DynamoDB |
| 이미지 저장 | AWS S3 |
| AI 추천 | AWS Bedrock (Claude 3 Haiku) |
| 배포 | AWS EC2 (Amazon Linux) |
| 빌드 | Gradle |

---

## 3. 시스템 구성도

```
[ 사용자 브라우저 ]
        │
        │ HTTP (8095)
        ▼
[ EC2 - Spring Boot 서버 ]
        │
        ├──────────────────────────────────────┐
        │                                      │
        ▼                                      ▼
[ AWS DynamoDB ]                      [ AWS S3 ]
  - 유저 정보 저장                      - 의류 사진 저장
  - 의류 정보 저장                        (clothing/{userId}/{uuid}.jpg)
  - 세탁 기록 저장
  - 추천 기록 저장
        │
        ▼
[ AWS Bedrock ]
  - Claude 3 Haiku 모델
  - 날씨 기반 코디 추천
  - 이미지 분석 (의류 색상/카테고리 자동 인식)
        │
        ▼
[ 공공 날씨 API ]
  - 기온 / 날씨 / 습도 수신
```

---

## 4. DynamoDB 테이블 구조

### 4-1. Clothing 테이블 (의류)

**파티션 키**: `userId` | **정렬 키**: `clothingId`

```json
{
  "userId":      "cf29a25c-e0b8-4a92-...",   ← 파티션 키 (어떤 유저의 옷인지)
  "clothingId":  "4ce0a9ff-0679-4abb-...",   ← 정렬 키 (옷 고유 ID)
  "category":    "top",
  "subcategory": "맨투맨",
  "color":       "검정",
  "material":    "면",
  "season":      "가을",
  "thickness":   2,
  "imageUrl":    "https://sgu-trion-2-s3.s3.ap-northeast-2.amazonaws.com/clothing/.../xxx.jpg",  ← S3 URL
  "tags":        ["데일리", "편함"],
  "wearCount":   3,
  "lastWornDate":"2026-06-09",
  "isInLaundry": false,
  "createdAt":   "2026-06-09T08:28:02Z"
}
```

> 파티션 키(userId)로 특정 유저의 옷만 빠르게 조회  
> 정렬 키(clothingId)로 개별 옷 단건 조회/수정/삭제

---

### 4-2. User 테이블 (유저 정보)

**파티션 키**: `userId`

```json
{
  "userId":       "cf29a25c-e0b8-4a92-...",
  "nickname":     "한비",
  "email":        "test@example.com",
  "gender":       "female",
  "bio":          "자기소개",
  "styleTypes":   "casual,soft",
  "personalTone": "cool",
  "faceShape":    "oval",
  "fitPreference":"slim",
  "height":       162,
  "createdAt":    "2026-06-09T00:00:00Z"
}
```

---

### 4-3. Recommendation 테이블 (추천 기록)

**파티션 키**: `userId` | **정렬 키**: `recommendationId`

```json
{
  "userId":           "cf29a25c-...",
  "recommendationId": "rec-001",
  "aiResponse":       "추천 코디: 검정 맨투맨, 청바지, 없음, 스니커즈, 없음\n추천 이유: ...",
  "temperature":      "18.5",
  "weatherCondition": "맑음",
  "createdAt":        "2026-06-09T08:00:00Z"
}
```

---

## 5. S3 이미지 저장 구조

```
sgu-trion-2-s3/
  └── clothing/
        ├── {userId-1}/
        │     ├── {uuid}.jpg
        │     ├── {uuid}.webp
        │     └── ...
        └── {userId-2}/
              ├── {uuid}.jpg
              └── ...
```

- 유저별 폴더로 분리 저장
- 퍼블릭 읽기 허용 (GetObject)
- EC2 IAM 역할로 업로드 (PutObject)

---

## 6. 주요 기능 목록

### 6-1. 디지털 옷장
- 의류 등록 / 수정 / 삭제
- 사진 업로드 → S3 자동 저장
- 카테고리별 필터 (상의/하의/아우터/신발/악세사리)
- 착용 완료 버튼 → wearCount 증가 + lastWornDate 갱신
- 세탁 상태 관리 (안전 / 주의 / 위험 3단계)

### 6-2. 옷장 통계 (실시간)
| 통계 | 계산 방식 |
|------|-----------|
| 총 의류 | DB 전체 아이템 수 |
| 이번 달 착용 | lastWornDate가 이번 달인 옷 수 |
| 세탁 예정 | isInLaundry = true인 옷 수 |
| 활용도 | wearCount > 0인 옷 / 전체 × 100% |

### 6-3. AI 코디 추천
- 날씨 API에서 기온/습도/날씨 수신
- Bedrock Claude에게 옷장 목록 + 날씨 전달
- 스타일 탭 (캐주얼 / 포멀 / 소프트) 별로 다른 코디 추천
- 신발 + 악세사리 항상 포함
- 추천 결과에서 "착용 완료" 버튼 제공

### 6-4. 이미지 AI 분석 (의류)
- 옷 사진 업로드 시 Bedrock Claude Vision으로 자동 분석
- 색상 / 소재 / 카테고리 / 계절 자동 인식

### 6-5. AI 퍼스널 분석 (셀카)
- 마이페이지에서 셀카 사진 업로드
- Bedrock Claude Vision이 아래 항목 자동 분석

| 분석 항목 | 결과 값 |
|-----------|---------|
| 퍼스널 컬러 | cool / warm / neutral |
| 세부 톤 | summer-cool / winter-cool / spring-warm / autumn-warm |
| 얼굴형 | oval / round / square / heart / long |
| 체형별 선호 핏 | slim / regular / loose / oversized |

- 분석 결과 → 스타일 프로필 자동 입력 → 저장 → AI 코디 추천에 반영

### 6-6. 세탁 관리
- 세탁 중인 옷 목록 표시
- 세탁 완료 시 wearCount 0 초기화 → 세탁 상태 안전으로 변경

### 6-6. 마이페이지
- 프로필 (닉네임 / 자기소개 / 성별)
- 스타일 프로필 (선호 색상 / 스타일 타입 / 신체정보 / 퍼스널 톤)
- 통계 (보유 의류 / 세탁 필요 / 총 착용 횟수 / 활용도) - 실제 DB 데이터
- 최근 등록 의류 목록
- 계정 관리 (로그아웃 / 계정 삭제)

---

## 7. API 주요 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| POST | /api/users/{userId}/clothing | 의류 등록 |
| GET | /api/users/{userId}/clothing | 전체 의류 조회 |
| PUT | /api/users/{userId}/clothing/{id} | 의류 수정 |
| DELETE | /api/users/{userId}/clothing/{id} | 의류 삭제 |
| POST | /api/users/{userId}/clothing/upload-image | S3 이미지 업로드 |
| PATCH | /api/users/{userId}/clothing/{id}/wear | 착용 완료 |
| PATCH | /api/users/{userId}/clothing/{id}/laundry-status | 세탁 상태 변경 |
| GET | /api/recommendation/ai-full | AI 코디 추천 (날씨+스타일) |
| GET | /api/users/{userId} | 유저 프로필 조회 |
| PUT | /api/users/{userId} | 유저 프로필 수정 |
| POST | /api/users/{userId}/analyze-profile | 셀카 AI 분석 (퍼스널컬러/얼굴형/체형) |
| POST | /api/admin/migrate-images | S3 마이그레이션 (1회성) |

---

## 8. AI 추천 흐름

```
1. 프론트엔드 → 날씨 API 호출 (기온/날씨/습도)
        │
        ▼
2. /api/recommendation/ai-full?temp=18&weather=맑음&style=캐주얼
        │
        ▼
3. 백엔드: 유저 옷장 목록 + 스타일 프로필 조회
        │
        ▼
4. Bedrock Claude 3 Haiku 호출
   프롬프트: "옷장 목록 + 날씨 규칙 + 스타일 가이드"
        │
        ▼
5. AI 응답: "추천 코디: 검정 맨투맨, 청바지, 없음, 스니커즈, 없음"
        │
        ▼
6. 프론트엔드: AI 텍스트에서 실제 옷장 아이템 매칭
   → 착용 완료 버튼과 함께 카드 렌더링
```

---

## 9. AI 퍼스널 분석 흐름

```
마이페이지 → 스타일 프로필 탭 → 셀카 업로드
        │
        ▼
POST /api/users/{userId}/analyze-profile
{ imageUrl: "data:image/jpeg;base64,..." }
        │
        ▼
Bedrock Claude 3 Haiku (Vision)
프롬프트: "퍼스널 컬러 / 얼굴형 / 체형 분석 후 JSON 반환"
        │
        ▼
응답: { "personalTone":"cool", "toneSeason":"summer-cool",
        "faceShape":"oval", "fitPreference":"slim" }
        │
        ├─ 스타일 프로필 폼 자동 입력
        ├─ DynamoDB User 테이블 저장
        │
        ▼
AI 코디 추천 시 스타일 프로필로 활용
→ "퍼스널 톤: cool (summer-cool), 얼굴형: oval, 선호 핏: slim"
```

---

## 10. 이미지 처리 흐름

```
사진 선택 → FormData → POST /api/users/{userId}/clothing/upload-image
        │
        ▼
EC2 (S3Service) → S3 PutObject
        │
        ▼
S3 URL 반환 → DynamoDB imageUrl 필드에 URL만 저장

결과: DynamoDB는 URL 문자열만 보유, 실제 이미지는 S3에 저장
```

| 항목 | 내용 |
|------|------|
| 저장 위치 | AWS S3 (sgu-trion-2-s3) |
| 저장 경로 | clothing/{userId}/{uuid}.확장자 |
| DynamoDB 저장값 | S3 URL (짧은 문자열) |
| 접근 방식 | 퍼블릭 읽기 (GetObject 허용) |

---

## 10. 배포 방법 (EC2 수동 배포)

```bash
cd /home/ec2-user/OOTD-LOGIC
git pull origin hanbi
fuser -k -n tcp 8095
sleep 3
cd backend
./gradlew build -x test
nohup java -jar build/libs/demo-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```