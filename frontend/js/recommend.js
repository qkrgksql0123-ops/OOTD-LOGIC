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
        const weatherData = await fetchWeatherData();
        if (weatherData) {
            // Update conditions grid
            const conditionCards = document.querySelectorAll('.condition-card');
            if (conditionCards.length >= 4) {
                // Update temperature
                conditionCards[0].querySelector('.value').textContent = `${weatherData.temperature}°C`;

                // Update weather condition
                conditionCards[1].querySelector('.value').textContent = weatherData.weatherCondition || '정보 없음';

                // Update PM2.5 (미세먼지)
                const pm25Status = getPm25Status(weatherData.pm25);
                conditionCards[2].querySelector('.value').textContent = pm25Status;

                // Update humidity
                conditionCards[3].querySelector('.value').textContent = `${weatherData.humidity}%`;
            }

            // Add weather data to page for use by recommendation engine
            window.currentWeatherData = weatherData;
        }
    } catch (error) {
        console.error('Error loading weather for recommend page:', error);
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
