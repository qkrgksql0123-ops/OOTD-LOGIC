# OOTD-Logic PPT 정리

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | OOTD-Logic (AI 기반 옷차림 추천 앱) |
| 팀명 | Team TRION |
| 한줄 소개 | 사용자의 옷장, 퍼스널 컬러/체형, 실시간 날씨를 분석해 매일 최적의 코디를 추천하고 디지털 옷장·세탁 주기를 관리하는 스마트 패션 플랫폼 |
| 배포 서버 | http://54.116.165.249:8095 |
| 배포 브랜치 | hanbi |

---

## 2. Use Case Diagram

**액터(Actor)**
- 사용자 (User)
- AWS Bedrock (AI 분석/추천 엔진)
- 공공 날씨 API (기상청)

**주요 Use Case**
- 회원가입 / 로그인 / 로그아웃
- 비밀번호 변경
- 의류 등록 / 수정 / 삭제 (디지털 옷장)
- 의류 사진 업로드 → (include) AI 이미지 자동 분석 (색상/소재/카테고리/계절)
- AI 코디 추천 받기 → (include) 날씨 정보 조회, (include) Bedrock AI 호출
- 착용 완료 처리 (wearCount/lastWornDate 갱신)
- 세탁 상태 관리 (세탁 완료 → 안전 단계 전환)
- 셀카 업로드 → (include) AI 퍼스널 분석(퍼스널컬러/얼굴형/체형) → 스타일 프로필 자동 저장
- 마이페이지 프로필/통계 조회

**관계 구조 예시**
```
[사용자] ──(include)──> [AI 코디 추천 받기] ──(include)──> [날씨 조회] / [Bedrock 호출]
[사용자] ──(include)──> [의류 사진 업로드] ──(include)──> [AI 이미지 분석]
[사용자] ──(include)──> [셀카 업로드 분석] ──(include)──> [Bedrock Vision 분석]
```

---

## 3. 요구사항 정의

**기능 요구사항**

| ID | 요구사항 |
|---|---|
| FR-01 | 회원가입/로그인 (JWT 인증, 비밀번호 BCrypt 암호화) |
| FR-02 | 비밀번호 변경 기능 |
| FR-03 | 의류 등록/수정/삭제 및 이미지(S3) 업로드 |
| FR-04 | 의류 사진 기반 AI 자동 분석 (색상/소재/카테고리/계절) |
| FR-05 | 날씨 + 스타일(캐주얼/포멀/소프트) + 퍼스널 프로필 기반 AI 코디 추천 |
| FR-06 | 착용 완료 처리 (착용횟수/마지막 착용일 갱신) |
| FR-07 | 세탁 상태 3단계 관리 (안전/주의/세탁필요) 및 세탁 완료 처리 |
| FR-08 | 셀카 기반 퍼스널컬러/얼굴형/체형 AI 분석 및 프로필 자동 반영 |
| FR-09 | 마이페이지 실시간 통계 (보유 의류/이번달 착용/세탁 필요/활용도) |

**비기능 요구사항**

| ID | 요구사항 |
|---|---|
| NFR-01 | AWS 클라우드 기반 인프라 (EC2, DynamoDB, S3, Bedrock) |
| NFR-02 | 반응형 웹 UI (모바일/데스크탑 대응) |
| NFR-03 | 이미지는 S3에 저장, DB에는 URL만 저장하여 용량 최적화 |
| NFR-04 | AI 응답은 한국어, 10초 내 응답 목표 |

---

## 4. 시스템 구성도

```
[사용자 브라우저]
        │ HTTP (8095)
        ▼
[EC2 - Spring Boot 서버]
        ├──────────────┬──────────────┐
        ▼              ▼              ▼
 [AWS DynamoDB]    [AWS S3]      [AWS Bedrock]
  - User           - 의류 이미지    - Claude 3 Haiku
  - Clothing         저장          - 코디 추천
  - Recommendation                 - 이미지/셀카 분석
        │
        ▼
 [공공 날씨 API(기상청)] - 기온/날씨/습도
```

---

## 5. 데이터 구조 (JSON, ERD 대신)

**Clothing (PK: userId, SK: clothingId)**
```json
{
  "userId": "cf29a25c-...",
  "clothingId": "4ce0a9ff-...",
  "category": "top",
  "subcategory": "맨투맨",
  "color": "검정",
  "material": "면",
  "season": "가을",
  "thickness": 2,
  "imageUrl": "https://sgu-trion-2-s3.s3.ap-northeast-2.amazonaws.com/clothing/...jpg",
  "tags": ["데일리"],
  "wearCount": 3,
  "lastWornDate": "2026-06-09",
  "isInLaundry": false,
  "createdAt": "2026-06-09T08:28:02Z"
}
```

**User (PK: userId)**
```json
{
  "userId": "cf29a25c-...",
  "email": "test@example.com",
  "passwordHash": "$2a$10$...",
  "nickname": "한비",
  "gender": "female",
  "bio": "자기소개",
  "styleTypes": "casual,soft",
  "preferredColors": "blue,beige",
  "personalTone": "cool",
  "toneSeason": "summer-cool",
  "faceShape": "oval",
  "fitPreference": "slim",
  "height": 162,
  "createdAt": "2026-06-09T00:00:00Z"
}
```

**Recommendation (PK: userId, SK: recommendDate)**
```json
{
  "userId": "cf29a25c-...",
  "recommendDate": "2026-06-15",
  "recommendedOutfits": "추천 코디: 검정 맨투맨, 청바지, 없음, 스니커즈, 없음",
  "temperature": 18.5,
  "weatherCondition": "맑음",
  "generatedByModel": "bedrock-claude-3-haiku",
  "createdAt": "2026-06-15T08:00:00Z"
}
```

---

## 6. 최종 소스코드 Git URL

```
https://github.com/qkrgksql0123-ops/OOTD-LOGIC
브랜치: hanbi
```

---

## 7. 구현 기술 스택

| 구분 | 기술 |
|---|---|
| 백엔드 | Spring Boot 3.3 (Java 17), Gradle |
| 인증 | Spring Security, JWT, BCrypt |
| 프론트엔드 | HTML / CSS / JavaScript (Spring Boot static 서빙) |
| 데이터베이스 | AWS DynamoDB |
| 이미지 저장 | AWS S3 |
| AI | AWS Bedrock (Claude 3 Haiku) - 코디 추천, 이미지/셀카 분석 |
| 외부 API | 기상청 공공데이터 (ASOS 일자료) |
| 배포 | AWS EC2 (Amazon Linux) |

---

## 8. 시스템 구조 (서비스 흐름)

**① AI 코디 추천 흐름**
```
프론트 → 날씨 API 조회 → /api/recommendation/ai-full?temp=&weather=&style=
→ 백엔드: 옷장 목록 + 스타일/성별 프로필 조합
→ Bedrock Claude 3 Haiku 호출 (날씨규칙+스타일가이드+성별 반영 프롬프트)
→ AI 추천 텍스트 응답 → 프론트 옷장 아이템 매칭 → 카드 렌더링
```

**② AI 퍼스널 분석 흐름**
```
마이페이지 → 셀카 업로드 → POST /api/users/{userId}/analyze-profile
→ Bedrock Vision 분석 (퍼스널톤/세부톤/얼굴형/체형)
→ DynamoDB User 테이블 자동 저장 + 화면 즉시 반영
→ 이후 AI 코디 추천 시 프로필 반영
```

**③ 이미지 업로드 흐름**
```
사진 선택 → POST /api/users/{userId}/clothing/upload-image
→ S3 PutObject → S3 URL 반환 → DynamoDB imageUrl 필드 저장
```

**④ 세탁 관리 흐름**
```
착용 시 wearCount 증가 → 기준치 50% 도달 시 "주의" / 100% 도달 시 "세탁 필요"
→ 세탁 완료 클릭 → PATCH laundry-status → wearCount=0 초기화 → "안전" 단계 전환
```