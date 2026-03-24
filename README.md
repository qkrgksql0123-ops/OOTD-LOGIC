# 🧥 Trion OOTD-Logic

기온 및 개인 민감도 기반 지능형 의류 관리 플랫폼

## 📁 프로젝트 구조

```
OOTD-LOGIC/
├── backend/                    # Java Spring Boot 백엔드
│   ├── src/
│   ├── build.gradle
│   ├── settings.gradle
│   ├── gradlew
│   └── ...
│
├── frontend/                   # React 프론트엔드
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── TRION_PROJECT_DESIGN.md     # 프로젝트 설계 문서
├── IMPLEMENTATION_CHECKLIST.md # 구현 체크리스트
└── README.md
```

## 👥 팀 구성

| 이름 | 역할 | 브랜치 |
|------|------|--------|
| **한비** (팀장) | 백엔드 | `feature/han-bi-backend` |
| **최민우** | 프론트엔드 | `feature/minwoo-frontend` |
| **주현빈** | DB/알고리즘 | `feature/hyunbin-database` |

## 🚀 시작하기

### 백엔드 (Java/Spring Boot)

```bash
cd backend
./gradlew clean build
./gradlew bootRun
```

### 프론트엔드 (React)

```bash
cd frontend
npm install
npm start
```

## 📚 기술 스택

**백엔드:**
- Spring Boot 3.5
- Java 17
- AWS DynamoDB
- Google Gemini AI
- Gradle

**프론트엔드:**
- React
- TypeScript (예정)
- Axios (예정)

## 📖 문서

- [프로젝트 설계](./TRION_PROJECT_DESIGN.md)
- [구현 체크리스트](./IMPLEMENTATION_CHECKLIST.md)
- [Git 브랜치 전략 (Notion)](https://www.notion.so/32df9e8207128148a667d032a5e41dc3)

## 🔗 GitHub

[qkrgksql0123-ops/OOTD-LOGIC](https://github.com/qkrgksql0123-ops/OOTD-LOGIC)

---

**최종 업데이트**: 2026.03.24
