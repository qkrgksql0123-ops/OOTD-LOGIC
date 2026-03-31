// API 기본 설정
const API_BASE_URL = 'http://localhost:8090/api';

// API 호출 공통 함수
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Authorization 헤더 추가
    const token = localStorage.getItem('accessToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        // 401 Unauthorized 처리 (토큰 만료)
        if (response.status === 401) {
            console.warn('Token expired, attempting to refresh...');
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // 재귀적으로 요청 재시도
                return apiCall(endpoint, options);
            } else {
                // 토큰 갱신 실패 → 로그인 페이지로
                redirectToLogin();
                return null;
            }
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        return null;
    }
}

// 회원가입
async function signup(email, password, nickname) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password,
            nickname
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '회원가입 실패');
    }

    const data = await response.json();

    // 토큰 저장
    if (data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('user', JSON.stringify({
            userId: data.userId,
            email: data.email,
            nickname: data.nickname
        }));
    }

    return data;
}

// 로그인
async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '로그인 실패');
    }

    const data = await response.json();

    // 토큰 저장
    if (data.accessToken && data.refreshToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('user', JSON.stringify({
            userId: data.userId,
            email: data.email,
            nickname: data.nickname
        }));
    }

    return data;
}

// 로그아웃
async function logout() {
    try {
        await apiCall('/auth/logout', {
            method: 'POST'
        });
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        // 토큰 삭제
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        redirectToLogin();
    }
}

// 토큰 갱신
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refreshToken
            })
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        if (data.accessToken && data.refreshToken) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

// 로그인 페이지로 리다이렉트
function redirectToLogin() {
    window.location.href = '/login.html';
}

// 인증 확인
function isAuthenticated() {
    return !!localStorage.getItem('accessToken');
}

// 현재 사용자 정보
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// 페이지 로드 시 인증 확인
function checkAuth() {
    if (!isAuthenticated()) {
        // 공개 페이지 (로그인 필요 없음)
        const currentPage = window.location.pathname;
        const publicPages = ['login.html', 'signup.html', 'index.html', ''];

        // 현재 페이지가 공개 페이지인지 확인
        const isPublicPage = publicPages.some(page => currentPage.endsWith(page));

        if (!isPublicPage) {
            redirectToLogin();
        }
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', checkAuth);