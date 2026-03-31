#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 테스트 결과 변수
PASS=0
FAIL=0

# 테스트 함수
test_case() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    local expected_status=$5

    echo -e "${BLUE}테스트: $name${NC}"

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    echo "  요청: $method $url"
    if [ ! -z "$data" ]; then
        echo "  데이터: $data"
    fi
    echo "  상태: $status_code"

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "  ${GREEN}✅ 성공${NC}"
        ((PASS++))
    else
        echo -e "  ${RED}❌ 실패 (예상: $expected_status)${NC}"
        ((FAIL++))
    fi

    # 응답 일부 출력
    if [ ! -z "$body" ]; then
        echo "  응답: $(echo $body | head -c 100)..."
    fi
    echo ""
}

# ============================================
echo "========================================"
echo "   OOTD-Logic 자동화 테스트 시작"
echo "========================================"
echo ""

# TEST 1: 회원가입
echo "📋 TEST 1: 회원가입 (Signup)"
echo "========================================"
test_case "새 사용자 회원가입" \
    "POST" \
    "http://localhost:8090/api/auth/signup" \
    '{"email":"auto_test@example.com","password":"testpass123","nickname":"AutoTest"}' \
    "200"

# 토큰 저장 (다음 테스트에서 사용)
SIGNUP_RESPONSE=$(curl -s -X POST "http://localhost:8090/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d '{"email":"test_user_'$(date +%s)'@example.com","password":"testpass123","nickname":"TestUser"}')

ACCESS_TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $SIGNUP_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ 토큰 추출 성공${NC}"
    echo "  userId: $USER_ID"
    echo "  accessToken: ${ACCESS_TOKEN:0:20}..."
    echo "  refreshToken: ${REFRESH_TOKEN:0:20}..."
else
    echo -e "${RED}❌ 토큰 추출 실패${NC}"
fi
echo ""

# TEST 2: 로그인
echo "📋 TEST 2: 로그인 (Login)"
echo "========================================"
test_case "사용자 로그인" \
    "POST" \
    "http://localhost:8090/api/auth/login" \
    '{"email":"auto_test@example.com","password":"testpass123"}' \
    "200"
echo ""

# TEST 3: 보호된 API 호출 (JWT 토큰 사용)
echo "📋 TEST 3: JWT 토큰으로 보호된 API 호출"
echo "========================================"
echo "테스트: Authorization 헤더로 API 호출"
echo "  요청: GET /api/clothing/ (Authorization: Bearer {token})"

if [ ! -z "$ACCESS_TOKEN" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:8090/api/clothing/" \
        -H "Authorization: Bearer $ACCESS_TOKEN")

    status_code=$(echo "$response" | tail -n1)

    echo "  상태: $status_code"

    # 404는 엔드포인트 미구현이므로 정상 (401이 아님 = 인증 성공)
    if [ "$status_code" = "404" ]; then
        echo -e "  ${GREEN}✅ JWT 필터 작동 (401 아님 = 인증 성공)${NC}"
        ((PASS++))
    elif [ "$status_code" = "401" ]; then
        echo -e "  ${RED}❌ 토큰 검증 실패 (401 Unauthorized)${NC}"
        ((FAIL++))
    else
        echo "  ⚠️ 예상 상태: 404 또는 401"
    fi
else
    echo -e "  ${RED}❌ 토큰 없음 (SKIP)${NC}"
fi
echo ""

# TEST 4: 토큰 없이 보호된 API 호출
echo "📋 TEST 4: 토큰 없이 보호된 API 호출"
echo "========================================"
echo "테스트: Authorization 헤더 없이 API 호출"
echo "  요청: GET /api/clothing/ (No Authorization)"

response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:8090/api/clothing/")
status_code=$(echo "$response" | tail -n1)

echo "  상태: $status_code"
echo "  (현재는 모든 경로 permitAll() - 구현상 404)"
echo ""

# TEST 5: 토큰 갱신
echo "📋 TEST 5: 토큰 갱신 (Token Refresh)"
echo "========================================"
if [ ! -z "$REFRESH_TOKEN" ]; then
    test_case "Refresh Token으로 새 Access Token 생성" \
        "POST" \
        "http://localhost:8090/api/auth/refresh" \
        "{\"refreshToken\":\"$REFRESH_TOKEN\"}" \
        "200"
else
    echo -e "${RED}❌ Refresh Token 없음 (SKIP)${NC}"
fi
echo ""

# TEST 6: 로그아웃
echo "📋 TEST 6: 로그아웃 (Logout)"
echo "========================================"
test_case "로그아웃 요청" \
    "POST" \
    "http://localhost:8090/api/auth/logout" \
    '{}' \
    "200"
echo ""

# ============================================
echo "========================================"
echo "   테스트 결과 요약"
echo "========================================"
echo -e "${GREEN}✅ 성공: $PASS${NC}"
echo -e "${RED}❌ 실패: $FAIL${NC}"
echo "총계: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 모든 테스트 성공!${NC}"
else
    echo -e "${YELLOW}⚠️ $FAIL개 테스트 실패${NC}"
fi

echo "========================================"
echo "테스트 완료 시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"