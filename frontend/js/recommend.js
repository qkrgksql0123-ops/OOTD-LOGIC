// ===== Recommend Page JavaScript =====

const API_BASE_URL = 'http://localhost:8080/api';

// ===== Authentication Utility =====
function getCurrentUserId() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return null;
    }
    return userId;
}

document.addEventListener('DOMContentLoaded', function() {
    const userId = getCurrentUserId();
    if (userId) {
        loadRecommendationHistory(userId);
        loadWeatherForRecommend();
    }
    initializeRecommendPage();
});

// Fetch Weather Data from KMA API
async function fetchWeatherData() {
    try {
        const response = await fetch(`${API_BASE_URL}/environment/weather`);
        if (!response.ok) {
            throw new Error('날씨 데이터 조회 실패');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Load weather data for recommendation page
async function loadWeatherForRecommend() {
    try {
        console.log('📍 loadWeatherForRecommend() called');
        const weatherData = await fetchWeatherData();

        console.log('🌤️ Weather data received:', weatherData);

        if (weatherData) {
            // Update temperature
            const tempValue = document.querySelector('.temp-value');
            console.log('🌡️ temp-value element:', tempValue);
            if (tempValue) {
                tempValue.textContent = `${weatherData.temperature}°C`;
                console.log('✅ Temperature updated to:', `${weatherData.temperature}°C`);
            }

            // Update weather condition
            const weatherValue = document.querySelector('.weather-value');
            console.log('☁️ weather-value element:', weatherValue);
            if (weatherValue) {
                weatherValue.textContent = weatherData.weatherCondition || '정보 없음';
                console.log('✅ Weather updated to:', weatherData.weatherCondition);
            }

            // Update PM2.5 (미세먼지)
            const dustValue = document.querySelector('.dust-value');
            console.log('💨 dust-value element:', dustValue);
            if (dustValue) {
                const pm25Status = getPm25Status(weatherData.pm25);
                dustValue.textContent = pm25Status;
                console.log('✅ Dust updated to:', pm25Status);
            }

            // Update humidity
            const humidityValue = document.querySelector('.humidity-value');
            console.log('💧 humidity-value element:', humidityValue);
            if (humidityValue) {
                humidityValue.textContent = `${weatherData.humidity}%`;
                console.log('✅ Humidity updated to:', `${weatherData.humidity}%`);
            }

            // Add weather data to page for use by recommendation engine
            window.currentWeatherData = weatherData;

            // Generate AI recommendations based on weather
            generateWeatherBasedRecommendations();
            console.log('✅ Recommendations generated');
        } else {
            console.warn('⚠️ No weather data received');
        }
    } catch (error) {
        console.error('❌ Error loading weather for recommend page:', error);
    }
}

// Get PM2.5 status
function getPm25Status(pm25) {
    if (!pm25) return '정보 없음';
    if (pm25 <= 30) return '좋음';
    if (pm25 <= 80) return '보통';
    if (pm25 <= 150) return '나쁨';
    return '매우 나쁨';
}

// Load recommendation history
async function loadRecommendationHistory(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/recommendations`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const recommendations = await response.json();
            renderRecommendations(recommendations);
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

// Generate AI recommendations based on weather data
async function generateWeatherBasedRecommendations() {
    try {
        const weatherData = await fetchWeatherData();
        if (!weatherData) {
            console.error('No weather data available');
            return;
        }

        const recommendations = generateRecommendations(weatherData);
        renderWeatherBasedRecommendations(recommendations, weatherData);
    } catch (error) {
        console.error('Error generating recommendations:', error);
    }
}

// Generate recommendation objects based on weather
function generateRecommendations(weatherData) {
    const temp = weatherData.temperature;
    const condition = weatherData.weatherCondition;
    const humidity = weatherData.humidity;

    const recommendations = [];

    // Temperature-based recommendations
    if (temp < 5) {
        // Very cold
        recommendations.push({
            title: '따뜻한 겨울 레이어링',
            items: ['두꺼운 울 코트', '발열 내복', '두터운 팬츠', '부츠'],
            confidence: 92,
            reason: `${temp}°C의 매우 추운 날씨입니다. 따뜻한 코트와 레이어링으로 체온 유지가 필수입니다.`
        });
        recommendations.push({
            title: '고급스러운 겨울 룩',
            items: ['캐시미어 스웨터', '검은색 슬렉스', '긴 코트', '가죽 구두'],
            confidence: 85,
            reason: `포멀한 자리에서도 따뜻하게 입을 수 있는 고급 소재 조합입니다.`
        });
    } else if (temp < 10) {
        // Cold
        recommendations.push({
            title: '아우터 필수 룩',
            items: ['베이지 트렌치 코트', '롤넥 니트', '슬림 팬츠', '스니커즈'],
            confidence: 88,
            reason: `${temp}°C에서는 아우터가 필수입니다. 클래식한 조합으로 어디든 잘 어울립니다.`
        });
        recommendations.push({
            title: '캐주얼 겨울 스타일',
            items: ['데님 재킷', '흰색 맨투맨', '회색 팬츠', '스니커즈'],
            confidence: 82,
            reason: `가볍고 편한 아우터로 캐주얼한 일상을 완성합니다.`
        });
    } else if (temp < 15) {
        // Cool
        recommendations.push({
            title: '얇은 아우터 레이어링',
            items: ['라이트 자켓', '흰색 티셔츠', '진 팬츠', '스니커즈'],
            confidence: 90,
            reason: `${temp}°C에는 얇은 아우터가 딱 맞습니다. 레이어링으로 온도 조절이 가능합니다.`
        });
        recommendations.push({
            title: '미니멀 스프링 룩',
            items: ['흰 셔츠', '베이지 슬렉스', '가디건', '로퍼'],
            confidence: 84,
            reason: `봄 같은 날씨에 화사한 느낌을 더하면서도 따뜻합니다.`
        });
    } else if (temp < 20) {
        // Mild
        recommendations.push({
            title: '클래식 카주얼',
            items: ['화이트 기본 티셔츠', '라이트 데님 팬츠', '베이지 오버핏 재킷', '스니커즈'],
            confidence: 85,
            reason: `${temp}°C의 쾌적한 날씨입니다. 가벼운 레이어링이 완벽합니다.`
        });
        recommendations.push({
            title: '모던 미니멀',
            items: ['크림색 긴소매 셔츠', '차콜 슬렉스', '카멜 토트백', '로퍼'],
            confidence: 78,
            reason: `깔끔한 미니멀 스타일로 어디든 어울립니다.`
        });
    } else if (temp < 25) {
        // Warm
        recommendations.push({
            title: '가벼운 봄 룩',
            items: ['반소매 티셔츠', '에크루 린넨 팬츠', '얇은 셔츠', '슬리퍼'],
            confidence: 87,
            reason: `${temp}°C로 따뜻한 날씨입니다. 반소매와 얇은 소재로 편하게 입으세요.`
        });
        recommendations.push({
            title: '프레시한 여름 프리룩',
            items: ['페이스 롤넥', '화이트 반바지', '린넨 셔츠', '샌들'],
            confidence: 80,
            reason: `밝은 색상과 가벼운 소재로 시원한 느낌을 연출합니다.`
        });
    } else {
        // Hot
        recommendations.push({
            title: '시원한 여름 룩',
            items: ['반소매 티셔츠', '반바지', '린넨 셔츠', '샌들'],
            confidence: 89,
            reason: `${temp}°C로 더운 날씨입니다. 얇은 소재와 환기가 좋은 옷이 필수입니다.`
        });
        recommendations.push({
            title: '우아한 여름 드레스 룩',
            items: ['린넨 드레스', '가디건', '선글라스', '슬리퍼'],
            confidence: 85,
            reason: `시원하면서도 세련된 느낌의 여름 스타일입니다.`
        });
    }

    // Weather condition-based adjustments
    if (condition === '비' || condition.includes('비')) {
        recommendations.forEach(rec => {
            rec.items.push('방수 재킷 또는 우산');
        });
    }

    if (condition === '눈' || condition.includes('눈')) {
        recommendations.forEach(rec => {
            rec.items.push('방한 장갑');
        });
    }

    return recommendations;
}

// Render weather-based recommendations
function renderWeatherBasedRecommendations(recommendations, weatherData) {
    const outfitsGrid = document.querySelector('.outfits-grid');
    if (!outfitsGrid) return;

    outfitsGrid.innerHTML = '';

    recommendations.forEach((rec, index) => {
        const card = document.createElement('div');
        card.className = 'outfit-card';
        card.innerHTML = `
            <div class="outfit-image">
                <div class="outfit-placeholder">
                    <i class="fas fa-shirt"></i>
                </div>
                <span class="confidence-badge">
                    <i class="fas fa-check-circle"></i> ${rec.confidence}% 추천도
                </span>
            </div>
            <div class="outfit-info">
                <h3>${rec.title}</h3>
                <div class="outfit-items">
                    ${rec.items.map(item => `<p><i class="fas fa-check"></i> ${item}</p>`).join('')}
                </div>
                <div class="outfit-reason">
                    <strong>추천 이유:</strong> ${rec.reason}
                </div>
                <div class="weather-badge">
                    <span>🌡️ ${weatherData.temperature}°C</span>
                    <span>💧 ${weatherData.humidity}%</span>
                    <span>${getWeatherEmoji(weatherData.weatherCondition)} ${weatherData.weatherCondition}</span>
                </div>
                <button class="btn btn-outfit">자세히 보기</button>
            </div>
        `;
        outfitsGrid.appendChild(card);
    });

    attachRecommendationEventListeners();
}

// Get weather emoji
function getWeatherEmoji(condition) {
    if (condition.includes('맑')) return '☀️';
    if (condition.includes('구름')) return '☁️';
    if (condition.includes('비')) return '🌧️';
    if (condition.includes('눈')) return '❄️';
    if (condition.includes('안개')) return '🌫️';
    return '🌤️';
}

// Render recommendations
function renderRecommendations(recommendations) {
    const outfitGrid = document.querySelector('.outfit-grid');
    if (!outfitGrid) return;

    if (recommendations.length === 0) {
        outfitGrid.innerHTML = '<p>추천 이력이 없습니다.</p>';
        return;
    }

    outfitGrid.innerHTML = '';
    recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'outfit-card';
        card.innerHTML = `
            <div class="outfit-image">
                <img src="https://via.placeholder.com/300" alt="추천 코디">
            </div>
            <div class="outfit-info">
                <h3>추천 코디</h3>
                <p class="date">${rec.recommendDate}</p>
                <p class="description">${rec.recommendedOutfits || '최적화된 추천입니다'}</p>
                <p class="weather">기온: ${rec.temperature}°C | 날씨: ${rec.weatherCondition}</p>
                <div class="outfit-actions">
                    <button class="btn-outfit">상세 정보</button>
                </div>
            </div>
        `;
        outfitGrid.appendChild(card);
    });

    // Re-attach event listeners
    attachRecommendationEventListeners();
}

// Attach event listeners
function attachRecommendationEventListeners() {
    const outfitBtns = document.querySelectorAll('.btn-outfit');
    outfitBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.outfit-card');
            const outfit = card.querySelector('.description').textContent;
            alert(`추천 코디: ${outfit}`);
        });
    });
}

function initializeRecommendPage() {
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
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the selected tab
            const selectedTab = this.getAttribute('data-tab');
            
            // Show/hide outfits based on tab
            const outfitCards = document.querySelectorAll('.outfit-card');
            outfitCards.forEach(card => {
                if (selectedTab === 'all') {
                    card.style.display = 'block';
                    card.style.animation = 'riseIn 0.6s ease';
                } else {
                    // You can add data attributes to outfit cards for filtering
                    card.style.display = 'block';
                    card.style.animation = 'riseIn 0.6s ease';
                }
            });
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
