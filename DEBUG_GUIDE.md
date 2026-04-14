# 디버깅 가이드

## 🔍 Console 에러 확인 방법

1. **브라우저 열기**: http://localhost:8093/closet.html
2. **F12 키** 눌러서 개발자 도구 열기
3. **Console 탭** 클릭
4. **빨간 에러 메시지** 확인

## ✅ Console에서 테스트할 수 있는 코드

```javascript
// 1. API_BASE_URL이 정의되었는지 확인
console.log(API_BASE_URL)

// 2. 버튼이 있는지 확인
console.log(document.getElementById('addClothingBtn'))

// 3. localStorage에 userId가 있는지 확인
console.log(localStorage.getItem('userId'))

// 4. 버튼 클릭 시뮬레이션
document.getElementById('addClothingBtn').click()
```

## 🐛 일반적인 에러

- `API_BASE_URL is not defined` → script.js가 로드되지 않음
- `Cannot read properties of null` → HTML 요소를 찾을 수 없음
- `Uncaught SyntaxError` → JavaScript 문법 에러

## 📝 에러 메시지를 알려주세요!

콘솔에 보이는 **빨간 에러 메시지를 그대로 복사해서** 알려주세요!
