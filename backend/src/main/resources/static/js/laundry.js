/* ===== Laundry Page Scripts ===== */
// API_BASE_URL is defined in script.js

// ===== Authentication Utility =====
function getCurrentUserId() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return null;
    }
    return userId;
}

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
    const userId = getCurrentUserId();
    if (userId) {
        loadLaundryList(userId);
    }
    initializeLaundryPage();
});

// Load laundry list from API
async function loadLaundryList(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/clothing`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const clothings = await response.json();
            renderLaundryItems(clothings);
        }
    } catch (error) {
        console.error('Error loading laundry list:', error);
    }
}

// Render laundry items
function renderLaundryItems(clothings) {
    const laundryGrid = document.querySelector('.laundry-grid');
    if (!laundryGrid) return;

    laundryGrid.innerHTML = '';

    clothings.forEach(clothing => {
        const laundryCard = document.createElement('div');
        laundryCard.className = clothing.isInLaundry ? 'laundry-card urgent' : 'laundry-card clean';
        laundryCard.innerHTML = `
            <div class="laundry-header">
                <h3>${clothing.subcategory || clothing.category}</h3>
                <span class="urgency-badge">${clothing.isInLaundry ? '세탁중' : '안심'}</span>
            </div>
            <div class="laundry-info">
                <p><strong>카테고리:</strong> ${clothing.category}</p>
                <p><strong>색상:</strong> ${clothing.color}</p>
                <p><strong>소재:</strong> ${clothing.material}</p>
            </div>
        `;
        laundryGrid.appendChild(laundryCard);
    });
}

function initializeLaundryPage() {
    // Navigation
    const menuToggle = document.querySelector('.navbar-toggle');
    const navMenu = document.querySelector('.navbar-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when link is clicked
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    });
}