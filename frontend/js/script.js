// ===== Authentication Check =====
document.addEventListener('DOMContentLoaded', function() {
    // 페이지 로드 시 인증 확인
    checkAuth();
    updateNavigation();

    // 현재 사용자 정보 표시
    const user = getCurrentUser();
    if (user) {
        updateUserDisplay(user);
    }

    // 로그아웃 버튼 처리
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('정말 로그아웃하시겠습니까?')) {
                await logout();
            }
        });
    }

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

// 네비게이션 바 업데이트 (로그인/로그아웃 버튼)
function updateNavigation() {
    const navMenu = document.querySelector('.navbar-menu ul');
    if (!navMenu) return;

    const loginBtn = navMenu.querySelector('.btn-login');
    const isAuthenticated = localStorage.getItem('accessToken') !== null;

    if (isAuthenticated) {
        // 로그인 상태 → 로그아웃 버튼으로 변경
        if (loginBtn) {
            loginBtn.textContent = '로그아웃';
            loginBtn.classList.remove('btn-login');
            loginBtn.classList.add('btn-logout');
            loginBtn.href = '#';

            // 클릭 이벤트 추가
            loginBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('정말 로그아웃하시겠습니까?')) {
                    await logout();
                }
            });
        }
    } else {
        // 비로그인 상태 → 로그인 버튼 유지
        if (loginBtn) {
            loginBtn.textContent = '로그인';
            loginBtn.classList.add('btn-login');
            loginBtn.classList.remove('btn-logout');
            loginBtn.href = 'login.html';
        }
    }
}

// 사용자 정보 화면에 표시
function updateUserDisplay(user) {
    const userNameEl = document.getElementById('userName');
    const userNicknameEl = document.getElementById('userNickname');
    const userEmailEl = document.getElementById('userEmail');

    if (userNameEl) {
        userNameEl.textContent = user.nickname || '사용자';
    }
    if (userNicknameEl) {
        userNicknameEl.textContent = user.nickname || '';
    }
    if (userEmailEl) {
        userEmailEl.textContent = user.email || '';
    }

    // 로그인 상태 표시
    const loginStatus = document.getElementById('loginStatus');
    if (loginStatus) {
        loginStatus.textContent = `${user.nickname || '사용자'}님 로그인됨`;
        loginStatus.classList.add('logged-in');
    }

    // 마이페이지 프로필 정보 표시
    loadMyPageProfile(user);
}

// 마이페이지 프로필 정보 로드
function loadMyPageProfile(user) {
    // 프로필 카드 정보 업데이트
    const profileNickname = document.getElementById('profileNickname');
    const profileEmail = document.getElementById('profileEmail');
    const profileJoined = document.getElementById('profileJoined');
    const nicknameInput = document.getElementById('nickname');

    if (profileNickname) {
        profileNickname.textContent = user.nickname || '사용자';
    }
    if (profileEmail) {
        profileEmail.textContent = user.email || '이메일 없음';
    }
    if (profileJoined) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        profileJoined.textContent = `가입일: ${year}년 ${month}월 ${day}일`;
    }
    if (nicknameInput) {
        nicknameInput.value = user.nickname || '';
    }
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

// ===== Modal Functions =====
function openAddClothingModal() {
    document.getElementById('addClothingModal').classList.add('show');
}

function closeAddClothingModal() {
    document.getElementById('addClothingModal').classList.remove('show');
    document.getElementById('clothingForm').reset();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addClothingModal');
    if (event.target == modal) {
        closeAddClothingModal();
    }
}

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

// ===== Form Submission =====
document.getElementById('clothingForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    addClothing();
});

// ===== API Functions =====

// Add Clothing
async function addClothing() {
    const userId = getCurrentUserId();
    const clothing = {
        category: document.getElementById('clothingCategory').value,
        imageUrl: '', // 이미지 업로드는 나중에 추가
        tags: document.getElementById('clothingTags').value.split(',').map(tag => tag.trim())
    };

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/clothing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clothing)
        });

        if (response.ok) {
            alert('의류가 추가되었습니다!');
            closeAddClothingModal();
            loadClothing();
        } else {
            alert('의류 추가에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error adding clothing:', error);
        alert('오류가 발생했습니다.');
    }
}

// Load Clothing List
async function loadClothing() {
    const userId = getCurrentUserId();
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/clothing`);
        const clothings = await response.json();

        const clothingItems = document.getElementById('clothing-items');

        if (clothings.length === 0) {
            clothingItems.innerHTML = '<p>아직 등록된 의류가 없습니다.</p>';
            return;
        }

        let html = '<div class="clothing-grid">';
        clothings.forEach(clothing => {
            html += `
                <div class="clothing-item">
                    <div class="category">${clothing.category}</div>
                    <h4>${clothing.id}</h4>
                    ${clothing.tags ? `<p class="tags">${clothing.tags.join(', ')}</p>` : ''}
                </div>
            `;
        });
        html += '</div>';

        clothingItems.innerHTML = html;
    } catch (error) {
        console.error('Error loading clothing:', error);
        document.getElementById('clothing-items').innerHTML = '<p>의류 목록을 불러올 수 없습니다.</p>';
    }
}

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
