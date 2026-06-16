# 🧥 OOTD-Logic

> AI 기반 개인 맞춤형 옷차림 추천 플랫폼

**Team TRION** | 2026

---

## 🔗 서비스 주소

**http://54.116.165.249:8095**

---

## 👥 팀 구성

| 이름 | 역할 |
|------|------|
| **한비** (팀장) | 백엔드 / 배포 / AI 연동 |
| **최민우** | 프론트엔드 |
| **주현빈** | DB / 알고리즘 |

---

## 🛠 기술 스택

### 백엔드
- **Java 17 / Spring Boot 3.5**
- **AWS DynamoDB** — 유저, 의류, 추천이력 저장
- **AWS S3** — 의류 이미지 저장 (버킷: `sgu-trion-2-s3`)
- **AWS Bedrock** — Claude 3 Haiku 모델 (코디 추천 / 셀카 분석)
- **기상청 공공 API** — 실시간 날씨 / 미세먼지 조회
- **JWT** — 로그인 인증 (AccessToken + RefreshToken)
- **BCrypt** — 비밀번호 해시 저장

### 프론트엔드
- HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- Spring Boot `static/` 폴더로 통합 서빙 (별도 프론트 서버 없음)

### 배포
- **AWS EC2** (Amazon Linux, 포트 8095)
- Gradle 빌드 후 JAR 실행

---

## 📁 프로젝트 구조

```
OOTD-LOGIC/
├── backend/
│   └── src/
│       └── main/
│           ├── java/com/trion/ootd/
│           │   ├── controller/     # REST API 컨트롤러
│           │   ├── service/        # 비즈니스 로직
│           │   ├── repository/     # DynamoDB 연동
│           │   ├── entity/         # 데이터 모델
│           │   └── dto/            # 요청/응답 DTO
│           └── resources/
│               ├── static/         # 프론트엔드 (HTML/CSS/JS)
│               └── application.yml
└── README.md
```

---

## ✨ 주요 기능

### 1. AI 코디 추천
- 기상청 API로 오늘 날씨/기온 조회
- 유저 스타일 프로필(퍼스널컬러, 선호 스타일, 체형) 반영
- AWS Bedrock Claude 3 Haiku로 개인 맞춤 코디 추천
- 캐주얼 / 포멀 / 소프트 탭별 다른 추천

### 2. 디지털 옷장
- 의류 등록 / 수정 / 삭제
- 사진 업로드 시 Bedrock Vision으로 색상/소재/카테고리/계절 자동 분석
- 이미지는 S3에 저장, URL로 조회
- 착용 완료 시 `wearCount` 증가 / `lastWornDate` 갱신

### 3. 세탁 관리
- 의류별 세탁 상태 자동 판별 (안전 / 주의 / 세탁 필요)
- 카테고리별 세탁 임계값 적용 (상의 1회, 하의 3회, 아우터 5회, 신발 15회)
- 세탁 완료 시 `wearCount` 초기화

### 4. AI 셀카 분석 (마이페이지)
- 셀카 업로드 → Bedrock Vision으로 분석
- 퍼스널컬러(cool/warm/neutral) + 얼굴형 + 체형별 핏 자동 인식
- 결과 자동으로 스타일 프로필에 저장 → 이후 추천에 반영

### 5. 로그인 / 회원가입
- 이메일 + 비밀번호 (BCrypt 해시 저장)
- JWT AccessToken + RefreshToken 발급
- 비밀번호 변경 기능

---

## 🗃 DynamoDB 테이블 구조

### User (PK: userId)
| 필드 | 설명 |
|------|------|
| userId | UUID |
| email, passwordHash, nickname | 기본 정보 |
| personalTone, toneSeason, faceShape, fitPreference | AI 분석 결과 |
| preferredColors, styleTypes | 스타일 프로필 |

### Clothing (PK: userId / SK: clothingId)
| 필드 | 설명 |
|------|------|
| category | top / bottom / outer / shoes / accessory |
| color, material, season, thickness | 의류 속성 |
| imageUrl | S3 URL |
| wearCount, lastWornDate, isInLaundry | 착용/세탁 상태 |

### Recommendation (PK: userId / SK: recommendDate)
| 필드 | 설명 |
|------|------|
| recommendedOutfits | 추천 코디 목록 |
| temperature, weatherCondition | 날씨 정보 |
| generatedByModel | 사용 AI 모델명 |

---

## 🚀 EC2 배포 방법

```bash
cd /home/ec2-user/OOTD-LOGIC
git pull origin hanbi
cd backend
fuser -k 8095/tcp || true && sleep 2
./gradlew build -x test
nohup java -jar build/libs/demo-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

---

## 🔑 주요 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/signup` | 회원가입 |
| GET | `/api/users/{userId}/clothing` | 의류 목록 조회 |
| POST | `/api/users/{userId}/clothing` | 의류 등록 |
| POST | `/api/users/{userId}/clothing/upload-image` | 이미지 S3 업로드 |
| GET | `/api/users/{userId}/recommendations` | 추천 이력 조회 |
| GET | `/api/users/{userId}/recommendations/generate` | AI 코디 추천 생성 |
| POST | `/api/users/{userId}/analyze-profile` | 셀카 AI 분석 |
| GET | `/api/environment/weather` | 날씨 조회 |

---

**최종 업데이트**: 2026.06.16