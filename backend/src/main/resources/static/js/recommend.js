// ===== Recommend Page JavaScript =====
// API_BASE_URL is defined in script.js
// getCurrentUserId() is defined in script.js

// ===== Authentication UI Update =====
function updateAuthenticationUI() {
    const userId = localStorage.getItem('userId');
    const nickname = localStorage.getItem('nickname');
    const loginBtn = document.querySelector('.btn-login');
    const navMenu = document.querySelector('.navbar-menu');

    if (userId && loginBtn && navMenu) {
        loginBtn.style.display = 'none';
        const li = loginBtn.parentElement;

        const nicknameEl = document.createElement('li');
        nicknameEl.innerHTML = `<span class="user-info" style="color: #004f60; font-weight: 600; padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-user-circle"></i>
            ${nickname || '사용자'}
        </span>`;
        li.parentElement.insertBefore(nicknameEl, li);

        loginBtn.textContent = '로그아웃';
        loginBtn.className = 'nav-link btn-logout';
        loginBtn.style.display = 'block';
        loginBtn.href = '#';
        loginBtn.onclick = function(e) {
            e.preventDefault();
            logout();
        };
    }
}

function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    localStorage.removeItem('accessToken');
    alert('로그아웃되었습니다.');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    updateAuthenticationUI();
    const userId = localStorage.getItem('userId');
    if (userId) {
        loadRecommendationHistory(userId);
        loadUserStyleProfile(userId);
        setupAIRecommendButton(userId);
    }
    loadWeatherForRecommend();
    initializeRecommendPage();
});

// ===== AI 텍스트 키워드 → DB 카테고리 매핑 =====
const CATEGORY_KEYWORDS = {
    'top':    ['티셔츠','셔츠','블라우스','니트','스웨터','맨투맨','탑','크롭','긴소매','반팔','상의'],
    'bottom': ['팬츠','진','청바지','슬렉스','스커트','반바지','데님','레깅스','하의'],
    'outer':  ['자켓','재킷','코트','패딩','가디건','점퍼','집업','블레이저','트렌치','아우터']
};

// AI 텍스트에서 DB 카테고리 키 추출
function extractCategories(aiText) {
    const found = [];
    for (const [dbCat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => aiText.includes(kw))) found.push(dbCat);
    }
    // 기본값: top / bottom 없으면 추가
    if (!found.includes('top'))    found.unshift('top');
    if (!found.includes('bottom') && found.length < 2) found.push('bottom');
    return found;
}

// 옷장에서 카테고리 매칭 (DB 카테고리명 기준)
function matchClothingByCategory(clothingList, categories) {
    const result = [];
    for (const cat of categories) {
        const matched = clothingList.filter(c => c.category === cat && !c.isInLaundry);
        if (matched.length > 0) result.push(matched[0]);
    }
    return result;
}

// 매칭된 옷을 카드로 렌더링
function renderMatchedCards(items, userId) {
    const grid = document.querySelector('.outfits-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = '<p style="padding:20px;color:#666;">옷장에 등록된 의류가 없습니다. 먼저 옷을 등록해주세요.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'outfit-card';
        card.dataset.clothingId = item.id;
        const imgHtml = item.imageUrl
            ? `<img src="${item.imageUrl}" alt="${item.category}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;">`
            : `<div class="outfit-placeholder" style="height:200px;display:flex;align-items:center;justify-content:center;background:#f0f4f8;border-radius:8px;"><i class="fas fa-shirt" style="font-size:48px;color:#aaa;"></i></div>`;

        card.innerHTML = `
            <div class="outfit-image">${imgHtml}</div>
            <div class="outfit-info">
                <h3>${item.color || ''} ${item.subcategory || item.category}</h3>
                <div class="outfit-items">
                    <p><i class="fas fa-tag"></i> ${item.category}</p>
                    ${item.season ? `<p><i class="fas fa-leaf"></i> ${item.season}</p>` : ''}
                    ${item.material ? `<p><i class="fas fa-layer-group"></i> ${item.material}</p>` : ''}
                </div>
                <button class="btn btn-wear" data-id="${item.id}"
                    style="margin-top:12px;width:100%;background:#004f60;color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">
                    <i class="fas fa-tshirt"></i> 착용 완료
                </button>
            </div>`;
        grid.appendChild(card);
    });

    // 착용 완료 버튼 이벤트
    grid.querySelectorAll('.btn-wear').forEach(btn => {
        btn.addEventListener('click', async function() {
            const clothingId = this.dataset.id;
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...';
            try {
                const res = await fetch(`${API_BASE_URL}/users/${userId}/clothing/${clothingId}/wear`, {
                    method: 'PATCH'
                });
                if (res.ok) {
                    this.innerHTML = '<i class="fas fa-check"></i> 착용 완료!';
                    this.style.background = '#27ae60';
                    this.closest('.outfit-card').style.opacity = '0.6';
                    showLaundryNotice();
                }
            } catch (e) {
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-tshirt"></i> 착용 완료';
            }
        });
    });
}

// 세탁 관리 이동 안내
function showLaundryNotice() {
    let notice = document.getElementById('laundry-notice');
    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'laundry-notice';
        notice.style.cssText = 'background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:14px 20px;margin:12px 0;text-align:center;';
        notice.innerHTML = `<i class="fas fa-water" style="color:#e67e22;"></i>
            <strong> 착용한 옷이 세탁 관리에 추가되었어요!</strong>
            <a href="laundry.html" style="margin-left:12px;color:#004f60;font-weight:700;">세탁 관리로 이동 →</a>`;
        document.querySelector('.outfits-grid')?.before(notice);
    }
}

// ===== 코디 등록 =====
async function registerOutfit(userId, aiText) {
    try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}/clothing`);
        if (!res.ok) return;
        const clothingList = await res.json();
        const categories = extractCategories(aiText);
        const matched = matchClothingByCategory(clothingList, categories);
        renderMatchedCards(matched, userId);

        // 섹션 제목 업데이트
        const sectionTitle = document.querySelector('.section h2:last-of-type') ||
                             document.querySelector('.outfits-grid')?.closest('.section')?.querySelector('h2');
        if (sectionTitle) sectionTitle.textContent = '내 옷장에서 찾은 추천 코디';

        // 탭 숨기기
        const tabs = document.querySelector('.recommendation-tabs');
        if (tabs) tabs.style.display = 'none';

        document.querySelector('.outfits-grid')?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
        console.error('코디 등록 실패:', e);
    }
}

// 스타일 프로필 불러와서 표시
async function loadUserStyleProfile(userId) {
    try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!res.ok) return;
        const user = await res.json();

        if (user.personalTone) {
            const tone = user.toneSeason ? `${user.personalTone} (${user.toneSeason})` : user.personalTone;
            const el = document.getElementById('r-tone');
            if (el) el.textContent = tone;
        }
        if (user.faceShape) {
            const el = document.getElementById('r-face');
            if (el) el.textContent = user.faceShape;
        }
        if (user.styleTypes) {
            const el = document.getElementById('r-styles');
            if (el) {
                el.innerHTML = user.styleTypes.split(',')
                    .map(s => `<span class="tag">${s.trim()}</span>`).join(' ');
            }
        }
    } catch (e) {
        console.error('스타일 프로필 로드 실패:', e);
    }
}

// AI 추천 버튼 핸들러
function setupAIRecommendButton(userId) {
    const btn = document.getElementById('ai-recommend-btn');
    if (!btn) return;

    btn.addEventListener('click', async function() {
        const originalText = this.innerHTML;
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI 분석 중...';

        const resultArea = document.getElementById('ai-result-area');
        const resultText = document.getElementById('ai-result-text');

        try {
            const res = await fetch(`${API_BASE_URL}/users/${userId}/recommendations/ai-full`);
            const text = await res.text();

            resultText.textContent = text;
            resultArea.style.display = 'block';

            // 코디 등록하기 버튼 추가
            let regBtn = document.getElementById('register-outfit-btn');
            if (!regBtn) {
                regBtn = document.createElement('button');
                regBtn.id = 'register-outfit-btn';
                regBtn.style.cssText = 'margin-top:14px;width:100%;padding:12px;background:#004f60;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;';
                regBtn.innerHTML = '<i class="fas fa-plus-circle"></i> 내 옷장에서 코디 찾기';
                resultArea.querySelector('div').appendChild(regBtn);
                regBtn.addEventListener('click', () => registerOutfit(userId, text));
            }

            resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {
            resultText.textContent = '추천 생성에 실패했습니다. 다시 시도해주세요.';
            resultArea.style.display = 'block';
        } finally {
            this.disabled = false;
            this.innerHTML = originalText;
        }
    });
}

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
