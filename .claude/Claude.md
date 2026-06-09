\## 대화 정책

대답은 "네, 한비님({이해도}) 로 시작하며 {이해도}가 90%일 경우 이해도를 높일수 있도록 추가적인 질문을 해줘

너가 지금 부터 하는 말은 나한테 다 한국말로 해줘

---

## 프로젝트 정보

**프로젝트명**: OOTD-Logic (옷차림 추천 앱)
**EC2 서버**: http://54.116.165.249:8095
**GitHub**: https://github.com/qkrgksql0123-ops/OOTD-LOGIC
**배포 브랜치**: hanbi
**자동 배포**: 현재 비활성 → EC2에서 수동 배포 (MobaXterm 사용)

---

## 기술 스택

- **백엔드**: Spring Boot (Java), DynamoDB (AWS)
- **프론트엔드**: HTML/CSS/JS (Spring Boot static 폴더로 서빙)
- **배포**: EC2 (Amazon Linux), Gradle 빌드
- **정적 파일 경로**: `backend/src/main/resources/static/`

---

## EC2 수동 배포 방법

```bash
cd /home/ec2-user/OOTD-LOGIC
git pull origin hanbi
cd backend
fuser -k 8095/tcp || true && sleep 2
./gradlew build -x test
nohup java -jar build/libs/demo-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

---

## DynamoDB 테이블 구조

### Clothing 테이블
- **파티션 키**: userId (String)
- **정렬 키**: clothingId (String)
- **GSI**: 없음

### 주요 엔티티 매핑 (Clothing.java)
- `@DynamoDbPartitionKey` → `getUserId()` → 속성명 "userId"
- `@DynamoDbSortKey` → `getId()` → 속성명 "clothingId"

---

## 수정 이력 (2026-06-04)

### 버그 수정
1. **DynamoDB 정렬 키 불일치** (`Clothing.java`)
   - `@DynamoDbAttribute("id")` → `@DynamoDbAttribute("clothingId")`
   - 원인: 저장 시 예외 발생 + save()가 예외를 삼켜 200 반환 → 실제 저장 안됨

2. **save() 예외 무시** (`DynamoDbClothingRepository.java`)
   - try-catch 제거 → 예외 전파되도록 수정

3. **delete() 잘못된 키** (`DynamoDbClothingRepository.java`)
   - `key.put("id", ...)` → `key.put("clothingId", ...)`

4. **수정 후 목록 갱신 안됨** (`closet.js`)
   - `renderClothingItems` 에 `closetGrid.innerHTML = ''` 항상 초기화 추가

5. **이미지 없이 수정 불가** (`closet.html`)
   - `<input required>` → `required` 제거

6. **하드코딩 가짜 데이터 제거** (`closet.html`)
   - closetGrid 샘플 의류 아이템 제거
   - 세탁 카드 샘플 제거
   - 옷장 현황 통계 125/42/12/78% → `-` (총 의류만 동적)

### 추가 기능
- `closet.js`: `totalCount` ID로 실제 의류 수 동적 업데이트
- `closet.js`: 수정 폼에 계절/두께 자동 채우기 (`data-season`, `data-thickness` 속성 활용)

---

## 주의사항

- MobaXterm에서 heredoc(`<< 'EOF'`) 사용 시 EOF가 반드시 줄 맨 앞에 와야 함
- bash에서 `!` 포함 명령어는 `set +H` 먼저 실행 필요
- Python 다중 줄 스크립트는 `echo` 명령어로 한 줄씩 `/tmp/f.py`에 써서 실행 권장
- 긴 명령어는 MobaXterm에서 줄 바꿈되어 오류 발생 가능 → 80자 이하로 유지

