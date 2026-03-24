// ===== API Configuration =====
const API_BASE_URL = 'http://localhost:8080/api';

// ===== Main Page Navigation =====
document.addEventListener('DOMContentLoaded', function() {
    initializeMainPage();
    
    // 기존 함수들 초기화
    const tempSlider = document.getElementById('tempSensitivity');
    if (tempSlider) {
        const tempValue = document.getElementById('tempValue');
        tempSlider.addEventListener('input', function() {
            tempValue.textContent = this.value;
        });
    }
});

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
    const clothing = {
        category: document.getElementById('clothingCategory').value,
        imageUrl: '', // 이미지 업로드는 나중에 추가
        tags: document.getElementById('clothingTags').value.split(',').map(tag => tag.trim())
    };

    try {
        const response = await fetch(`${API_BASE_URL}/clothing`, {
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
    try {
        const response = await fetch(`${API_BASE_URL}/clothing`);
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
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations`);
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

// Get Weather Info
async function getWeatherInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/environment`);
        const weather = await response.json();

        const weatherInfo = document.getElementById('weather-info');
        if (weather) {
            weatherInfo.innerHTML = `
                <p>기온: ${weather.temperature}°C</p>
                <p>날씨: ${weather.weatherCondition}</p>
                <p>습도: ${weather.humidity}%</p>
            `;
        }
    } catch (error) {
        console.error('Error loading weather:', error);
        document.getElementById('weather-info').innerHTML = '<p>날씨 정보를 불러올 수 없습니다.</p>';
    }
}

// Save Settings
async function saveSettings() {
    const settings = {
        tempSensitivity: document.getElementById('tempSensitivity').value,
        skinTone: document.getElementById('skinTone').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/user/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
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
