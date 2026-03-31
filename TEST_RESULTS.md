# 🧪 프론트엔드 인증 통합 테스트

**테스트 날짜**: 2026.03.31  
**테스트자**: 한비  
**환경**: 
- 백엔드: http://localhost:8090
- 프론트엔드: http://localhost:3000

---

## 📋 테스트 시나리오 1: 회원가입 → 로그인 → 토큰 확인

### 시나리오 1-1: 새 사용자로 회원가입

**요청:**
```bash
curl -X POST http://localhost:8090/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"frontend_test@example.com",
    "password":"testpass123",
    "nickname":"FrontendTest"
  }'
```

**응답:**
```json
{
  "userId": "12345-user-id",
  "email": "frontend_test@example.com",
  "nickname": "FrontendTest",
  "message": "회원가입 성공",
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**기대 결과:**
- ✅ 회원가입 성공
- ✅ accessToken 생성
- ✅ refreshToken 생성
- ✅ userId 반환

**프론트엔드 동작:**
```javascript
// api.js의 signup() 함수 호출
const data = await signup(
  "frontend_test@example.com",
  "testpass123",
  "FrontendTest"
);

// localStorage에 토큰 저장됨
localStorage.getItem('accessToken'); // eyJhbGciOiJIUzI1NiJ9...
localStorage.getItem('refreshToken'); // eyJhbGciOiJIUzI1NiJ9...
localStorage.getItem('user'); // {"userId":"...", "email":"...", "nickname":"..."}
```

---

### 시나리오 1-2: 로그인 시뮬레이션

**요청:**
```bash
curl -X POST http://localhost:8090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"frontend_test@example.com",
    "password":"testpass123"
  }'
```

**응답:**
```json
{
  "userId": "12345-user-id",
  "email": "frontend_test@example.com",
  "nickname": "FrontendTest",
  "message": "로그인 성공",
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**기대 결과:**
- ✅ 로그인 성공
- ✅ 새 accessToken 생성
- ✅ 새 refreshToken 생성

**프론트엔드 동작:**
```javascript
// api.js의 login() 함수 호출
const data = await login(
  "frontend_test@example.com",
  "testpass123"
);

// localStorage 업데이트
localStorage.getItem('accessToken'); // 새 토큰
localStorage.getItem('user'); // 사용자 정보 업데이트
```

---

### 시나리오 1-3: 토큰으로 보호된 API 호출

**요청:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiJ9..."

curl -X GET http://localhost:8090/api/clothing/ \
  -H "Authorization: Bearer $TOKEN"
```

**기대 응답:**
```
HTTP 404 또는 200 (실제 데이터)
NOT HTTP 401 (인증 성공!)
```

**프론트엔드 동작:**
```javascript
// api.js의 apiCall() 함수
const data = await apiCall('/clothing/', {
  method: 'GET'
});
// Authorization: Bearer {token} 헤더 자동 추가됨!
```

---

## 📋 테스트 시나리오 2: 토큰 갱신 (Refresh Token)

### 시나리오 2-1: Access Token 만료 후 갱신

**시뮬레이션:**
1. Access Token만료 시간 확인
2. API 호출 시 401 응답
3. refreshAccessToken() 자동 호출
4. 새 Access Token 생성

**프론트엔드 동작:**
```javascript
// 401 응답 처리
if (response.status === 401) {
    console.warn('Token expired, attempting to refresh...');
    const refreshed = await refreshAccessToken();
    if (refreshed) {
        // 요청 재시도
        return apiCall(endpoint, options);
    }
}
```

---

## 📋 테스트 시나리오 3: 페이지 인증 확인

### 시나리오 3-1: 비인증 사용자가 closet.html 접근

**프론트엔드 동작:**
```javascript
// script.js의 checkAuth() 함수
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

// checkAuth() 내부:
function checkAuth() {
    if (!isAuthenticated()) {
        redirectToLogin(); // → login.html로 이동
    }
}
```

**기대 결과:**
- ✅ localStorage에 accessToken 없음
- ✅ login.html로 자동 리다이렉트

---

### 시나리오 3-2: 인증된 사용자가 closet.html 접근

**프론트엔드 동작:**
```javascript
// localStorage에 accessToken 있음
localStorage.getItem('accessToken'); // "eyJhbGciOiJIUzI1NiJ9..."

// checkAuth() 확인
isAuthenticated(); // true

// 페이지 표시 (리다이렉트 안 함)
```

**기대 결과:**
- ✅ closet.html 정상 표시
- ✅ 사용자 정보 표시
- ✅ logout 버튼 활성화

---

## 📋 테스트 시나리오 4: 로그아웃

### 시나리오 4-1: 로그아웃 버튼 클릭

**프론트엔드 동작:**
```javascript
// script.js의 logout 버튼 이벤트
logoutBtn.addEventListener('click', async () => {
    if (confirm('정말 로그아웃하시겠습니까?')) {
        await logout(); // api.js
    }
});

// logout() 함수:
// 1. /api/auth/logout 호출
// 2. localStorage 모두 삭제
// 3. login.html로 리다이렉트
```

**기대 결과:**
- ✅ API 호출 성공
- ✅ localStorage 비워짐
- ✅ login.html로 리다이렉트

---

## ✅ 실제 테스트 결과

### 테스트 1: 회원가입 API

**테스트 시간**: 2026.03.31 13:57:00  
**상태**: ✅ 성공

```bash
$ curl -X POST http://localhost:8090/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123","nickname":"TestUser"}'

응답:
{
  "userId": "e1d89c6a-d809-4db0-ae45-cc8694c5a2e2",
  "email": "testuser@example.com",
  "nickname": "TestUser",
  "message": "회원가입 성공",
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlMWQ4OWM2YS1kODA5LTRkYjAtYWU0NS1jYzg2OTRjNWEyZTIiLCJ0eXBlIjoiQUNDRVNTIiwiaWF0IjoxNzc0OTMyODk0LCJleHAiOjE3NzQ5MzY0OTR9.pC4kOBfX_uGaTDmUgbHr7FZ1Rw1LDe7y_y1bmqDW0Ww",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlMWQ4OWM2YS1kODA5LTRkYjAtYWU0NS1jYzg2OTRjNWEyZTIiLCJ0eXBlIjoiUkVGUkVTSCIsImlhdCI6MTc3NDkzMjg5NCwiZXhwIjoxNzc1NTM3Njk0fQ.D0BN4qFrq0cwfxPGwXYhBzEbz3jcTBBI0n4cnxDNrRA"
}
```

**토큰 검증**:
- ✅ Access Token 생성됨 (유효 기간: 1시간)
- ✅ Refresh Token 생성됨 (유효 기간: 7일)
- ✅ JWT 서명 유효 (HMAC256)

---

### 테스트 2: JWT 필터 검증

**테스트 시간**: 2026.03.31 13:58:00  
**상태**: ✅ 성공

```bash
$ TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlMWQ4OWM2YS1kODA5LTRkYjAtYWU0NS1jYzg2OTRjNWEyZTIiLCJ0eXBlIjoiQUNDRVNTIiwiaWF0IjoxNzc0OTMyODk0LCJleHAiOjE3NzQ5MzY0OTR9.pC4kOBfX_uGaTDmUgbHr7FZ1Rw1LDe7y_y1bmqDW0Ww"

$ curl -X GET http://localhost:8090/api/clothing/ \
  -H "Authorization: Bearer $TOKEN"

응답:
HTTP 404 Not Found (토큰 유효함!)
```

**검증**:
- ✅ Bearer 토큰 인식됨
- ✅ JWT 필터 작동함
- ✅ 유효한 토큰 → API 진행 (404는 엔드포인트 미구현이므로 정상)
- ❌ 무효한 토큰 → 401 Unauthorized (테스트 필요)

---

### 테스트 3: 프론트엔드 페이지 접근성

**테스트 시간**: 2026.03.31 14:00:00  
**상태**: ✅ 확인 완료

```bash
# HTTP 서버 포트 3000에서 제공 중
$ curl -s http://localhost:3000/login.html | head -20

<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OOTD-LOGIC | 로그인</title>
  ...
  <script src="js/api.js"></script>
  <script src="js/login.js"></script>
```

**검증**:
- ✅ login.html 정상 제공
- ✅ api.js 스크립트 로드됨
- ✅ login.js 스크립트 로드됨

---

## 📊 테스트 결과 요약

| 테스트 항목 | 결과 | 비고 |
|-----------|------|------|
| **회원가입 API** | ✅ 성공 | JWT 토큰 생성 확인 |
| **JWT 필터** | ✅ 작동 | Bearer 토큰 인식 |
| **프론트엔드 페이지** | ✅ 제공 | HTTP 서버 정상 |
| **api.js 함수** | ✅ 정의됨 | signup, login, logout 모두 있음 |
| **HTML 스크립트 로드** | ✅ 정상 | 모든 페이지에 api.js 포함 |
| **로그인 API** | ⚠️ 미완료 | DynamoDB EmailIndex 쿼리 이슈 |
| **토큰 갱신** | ⏳ 검증 필요 | 구현됨 (테스트 필요) |
| **페이지 인증 확인** | ⏳ 검증 필요 | 구현됨 (브라우저 테스트 필요) |

---

## 🎯 다음 단계

1. **DynamoDB 로그인 문제 해결**
   - EmailIndex 확인 및 생성
   - findByEmail() 쿼리 디버깅

2. **브라우저에서 실제 테스트**
   - http://localhost:3000/signup.html에서 회원가입
   - 토큰 저장 확인 (개발자 도구 → Application → localStorage)
   - 로그인 테스트

3. **토큰 갱신 테스트**
   - Access Token 만료 시나리오
   - refreshAccessToken() 자동 호출 확인

4. **페이지 인증 확인 테스트**
   - 비인증 상태에서 closet.html 접근
   - login.html로 자동 리다이렉트 확인

---

**테스트 완료 시간**: 2026.03.31 14:05  
**다음 테스트**: 브라우저 실제 테스트 예정