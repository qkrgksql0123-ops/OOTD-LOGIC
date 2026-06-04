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

let allClothings = [];
let currentFilter = 'needed';

const LAUNDRY_THRESHOLD = {
    'top': 1, 'bottom': 3, 'outer': 5, 'shoes': 15
};

function getThreshold(c) {
    const sub = (c.subcategory || '').toLowerCase();
    if (c.category === 'shoes')  return 15;
    if (c.category === 'outer')  return 5;
    if (c.category === 'bottom') {
        if (sub.includes('청바지') || sub.includes('데님')) return 5;
        if (sub.includes('반바지')) return 2;
        return 3;
    }
    if (sub.includes('니트') || sub.includes('스웨터') || sub.includes('가디건')) return 3;
    return 1;
}

document.addEventListener('DOMContentLoaded', function() {
    updateAuthenticationUI();
    const userId = getCurrentUserId();
    if (userId) {
        loadLaundryList(userId);
    }
    initializeLaundryPage();
});

async function loadLaundryList(userId) {
    try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}/clothing`);
        if (!res.ok) return;
        allClothings = await res.json();
        updateStats(allClothings);
        renderByFilter(currentFilter, userId);
    } catch (e) {
        console.error('세탁 목록 로드 실패:', e);
    }
}

function updateStats(list) {
    const needed = list.filter(c => c.isInLaundry).length;
    const clean  = list.filter(c => !c.isInLaundry).length;
    const el = id => document.getElementById(id);
    if (el('laundry-needed-count')) el('laundry-needed-count').textContent = needed;
    if (el('laundry-clean-count'))  el('laundry-clean-count').textContent  = clean;
    if (el('laundry-total-count'))  el('laundry-total-count').textContent  = list.length;
}

function renderByFilter(filter, userId) {
    const filtered = filter === 'needed' ? allClothings.filter(c => c.isInLaundry)
                   : filter === 'clean'  ? allClothings.filter(c => !c.isInLaundry)
                   : allClothings;
    renderLaundryItems(filtered, userId);
}

function renderLaundryItems(list, userId) {
    const grid = document.getElementById('laundryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (list.length === 0) {
        grid.innerHTML = `<p style="padding:24px;color:#666;grid-column:1/-1;">
            ${currentFilter === 'needed' ? '세탁이 필요한 옷이 없어요! 🎉' : '등록된 의류가 없습니다.'}</p>`;
        return;
    }

    list.forEach(c => {
        const isNeeded = c.isInLaundry;
        const card = document.createElement('div');
        card.className = `laundry-card ${isNeeded ? 'urgent' : 'clean'}`;
        card.dataset.id = c.id;

        const imgHtml = c.imageUrl
            ? `<img src="${c.imageUrl}" alt="${c.category}" style="width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:10px;">`
            : `<div style="height:120px;background:#f0f4f8;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;">
                   <i class="fas fa-shirt" style="font-size:36px;color:#aaa;"></i></div>`;

        card.innerHTML = `
            ${imgHtml}
            <div class="laundry-header">
                <h3>${c.color ? c.color + ' ' : ''}${c.subcategory || c.category}</h3>
                <span class="urgency-badge">
                    <i class="fas fa-${isNeeded ? 'exclamation' : 'shield-alt'}"></i>
                    ${isNeeded ? '세탁 필요' : '깨끗함'}
                </span>
            </div>
            <div class="laundry-info">
                <div class="info-row"><strong>카테고리:</strong> <span>${c.category || '-'}</span></div>
                ${c.material ? `<div class="info-row"><strong>소재:</strong> <span>${c.material}</span></div>` : ''}
                ${c.lastWornDate ? `<div class="info-row"><strong>마지막 착용:</strong> <span>${c.lastWornDate}</span></div>` : ''}
                <div class="info-row"><strong>착용 횟수:</strong>
                    <span>${c.wearCount || 0}회 / 기준 ${getThreshold(c)}회</span>
                </div>
            </div>
            ${isNeeded ? `
            <button class="btn btn-mark-clean" data-id="${c.id}"
                style="width:100%;margin-top:12px;background:#27ae60;color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:600;">
                <i class="fas fa-check"></i> 세탁 완료
            </button>` : ''}`;

        grid.appendChild(card);
    });

    // 세탁 완료 버튼 이벤트
    if (userId) {
        grid.querySelectorAll('.btn-mark-clean').forEach(btn => {
            btn.addEventListener('click', async function() {
                const clothingId = this.dataset.id;
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...';
                try {
                    const res = await fetch(
                        `${API_BASE_URL}/users/${userId}/clothing/${clothingId}/laundry-status`,
                        { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ isInLaundry: false }) }
                    );
                    if (res.ok) {
                        const item = allClothings.find(c => c.id === clothingId);
                        if (item) item.isInLaundry = false;
                        updateStats(allClothings);
                        renderByFilter(currentFilter, userId);
                    }
                } catch (e) {
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-check"></i> 세탁 완료';
                }
            });
        });
    }
}

function initializeLaundryPage() {
    const menuToggle = document.querySelector('.navbar-toggle');
    const navMenu = document.querySelector('.navbar-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
        navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('active')));
    }

    // 탭 필터
    document.querySelectorAll('.laundry-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.laundry-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            const userId = localStorage.getItem('userId');
            renderByFilter(currentFilter, userId);
        });
    });
}