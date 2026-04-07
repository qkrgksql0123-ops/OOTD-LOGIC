// ===== API Configuration =====
const API_BASE_URL = 'http://localhost:8093/api';

// ===== Authentication Utility =====
function getCurrentUserId() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return null;
    }
    return userId;
}

// ===== Main Page Navigation =====
document.addEventListener('DOMContentLoaded', function() {
    updateAuthenticationUI();
    initializeMainPage();
    getWeatherInfo(); // Load weather data

    // 기존 함수들 초기화
    const tempSlider = document.getElementById('tempSensitivity');
    if (tempSlider) {
        const tempValue = document.getElementById('tempValue');
        tempSlider.addEventListener('input', function() {
            tempValue.textContent = this.value;
        });
    }
});

// ===== Authentication UI Update =====
function updateAuthenticationUI() {
    const userId = localStorage.getItem('userId');
    const nickname = localStorage.getItem('nickname');
    const loginBtn = document.querySelector('.btn-login');
    const navMenu = document.querySelector('.navbar-menu');

    if (userId && loginBtn && navMenu) {
        // 로그인 상태: 로그인 버튼 제거 및 로그아웃 버튼 추가
        loginBtn.style.display = 'none';

        // 사용자 정보 표시
        const li = loginBtn.parentElement;

        // 닉네임 표시
        const nicknameEl = document.createElement('li');
        nicknameEl.innerHTML = `<span class="user-info" style="color: #004f60; font-weight: 600; padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-user-circle"></i>
            ${nickname || '사용자'}
        </span>`;
        li.parentElement.insertBefore(nicknameEl, li);

        // 로그아웃 버튼으로 변경
        loginBtn.textContent = '로그아웃';
        loginBtn.className = 'nav-link btn-logout';
        loginBtn.style.display = 'block';
        loginBtn.href = '#';
        loginBtn.onclick = function(e) {
            e.preventDefault();
            logout();
        };
    } else if (!userId) {
        // 비로그인 상태: 기본 로그인 버튼 유지
        if (loginBtn) {
            loginBtn.href = 'login.html';
            loginBtn.textContent = '로그인';
            loginBtn.className = 'nav-link btn-login';
        }
    }
}

function logout() {
    // localStorage에서 사용자 정보 제거
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    localStorage.removeItem('accessToken');

    alert('로그아웃되었습니다.');
    window.location.href = 'index.html';
}

function initializeMainPage() {
    // Navigation toggle for mobile
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
        });
    }
    
    // Close menu when link is clicked
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (navbarMenu && this.classList.contains('nav-link')) {
                navbarMenu.classList.remove('active');
            }
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Note: Page-specific modal functions are in closet.js =====

// ===== Temperature Sensitivity Slider =====
document.addEventListener('DOMContentLoaded', function() {
    const tempSlider = document.getElementById('tempSensitivity');
    const tempValue = document.getElementById('tempValue');

    if (tempSlider) {
        tempSlider.addEventListener('input', function() {
            tempValue.textContent = this.value;
        });
    }
});

// ===== Note: Form submission and clothing API functions are in closet.js =====

// Get Recommendation
async function getRecommendation() {
    const userId = getCurrentUserId();
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/recommendations`);
        const recommendations = await response.json();

        const recommendationList = document.getElementById('recommendation-list');

        if (recommendations.length === 0) {
            recommendationList.innerHTML = '<p>오늘의 추천이 없습니다.</p>';
            return;
        }

        let html = '<div class="recommendation-grid">';
        recommendations.forEach(rec => {
            html += `
                <div class="recommendation-card">
                    <h4>추천 코디</h4>
                    <p class="confidence">신뢰도: ${rec.confidence || 'N/A'}</p>
                    <p>${rec.reason || '최적화된 추천입니다'}</p>
                </div>
            `;
        });
        html += '</div>';

        recommendationList.innerHTML = html;
    } catch (error) {
        console.error('Error loading recommendations:', error);
        document.getElementById('recommendation-list').innerHTML = '<p>추천을 불러올 수 없습니다.</p>';
    }
}

// Fetch Real Weather Data from KMA API
async function fetchWeatherData() {
    try {
        const response = await fetch(`${API_BASE_URL}/environment/weather`);
        if (!response.ok) {
            throw new Error('날씨 데이터 조회 실패');
        }
        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Get Weather Info
async function getWeatherInfo() {
    try {
        const weatherData = await fetchWeatherData();

        const weatherInfo = document.getElementById('weather-info');
        const weatherDisplay = document.querySelector('.weather-info');
        const dashboardWeather = document.querySelector('.dashboard-preview .preview-card:nth-child(2) .weather-info');

        if (weatherData) {
            const temp = weatherData.temperature || 'N/A';
            const condition = weatherData.weatherCondition || '정보 없음';
            const humidity = weatherData.humidity || 'N/A';
            const minTemp = weatherData.minTemp || 'N/A';
            const maxTemp = weatherData.maxTemp || 'N/A';

            const weatherHTML = `
                <p><strong>현재 기온:</strong> ${temp}°C</p>
                <p><strong>최저/최고:</strong> ${minTemp}°C / ${maxTemp}°C</p>
                <p><strong>날씨:</strong> ${condition}</p>
                <p><strong>습도:</strong> ${humidity}%</p>
                <p style="font-size: 0.85em; color: #999; margin-top: 10px;">기상청 공공 API 연동</p>
            `;

            if (weatherInfo) weatherInfo.innerHTML = weatherHTML;
            if (weatherDisplay) weatherDisplay.innerHTML = weatherHTML;
            if (dashboardWeather) dashboardWeather.innerHTML = weatherHTML;

            // Update weather warning
            updateWeatherWarning(weatherData);
        } else {
            const errorHTML = '<p style="color: #e74c3c;">날씨 정보를 불러올 수 없습니다.</p>';
            if (weatherInfo) weatherInfo.innerHTML = errorHTML;
            if (weatherDisplay) weatherDisplay.innerHTML = errorHTML;
        }
    } catch (error) {
        console.error('Error in getWeatherInfo:', error);
    }
}

// Update weather warning based on conditions
async function updateWeatherWarning(weatherData) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/environment/weather-warning?weatherCondition=${encodeURIComponent(weatherData.weatherCondition || '맑음')}&pm25=${weatherData.pm25 || 0}&pm10=${weatherData.pm10 || 0}`
        );
        if (response.ok) {
            const warning = await response.text();
            const warningElement = document.querySelector('.weather-warning');
            if (warningElement) {
                warningElement.innerHTML = `<p>${warning}</p>`;
            }
        }
    } catch (error) {
        console.error('Error updating weather warning:', error);
    }
}

// Save Settings
async function saveSettings() {
    const userId = getCurrentUserId();
    const tempSensitivity = document.getElementById('tempSensitivity').value;
    const skinTone = document.getElementById('skinTone').value;

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/settings?tempSensitivity=${tempSensitivity}&skinTone=${skinTone}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('설정이 저장되었습니다!');
        } else {
            alert('설정 저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('오류가 발생했습니다.');
    }
}
