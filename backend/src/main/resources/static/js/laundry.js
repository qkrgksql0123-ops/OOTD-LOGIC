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

// 세탁 상태 판별: needed / caution / safe
function getStatus(c) {
    if (c.isInLaundry) return 'needed';
    const threshold = getThreshold(c);
    const worn = c.wearCount || 0;
    if (worn >= Math.ceil(threshold * 0.5)) return 'caution';
    return 'safe';
}

const STATUS_CONFIG = {
    needed:  { label: '세탁 필요', color: '#e74c3c', icon: 'exclamation-circle',   bg: '#ffeaea' },
    caution: { label: '주의',      color: '#e67e22', icon: 'exclamation-triangle', bg: '#fff4e5' },
    safe:    { label: '안전',      color: '#27ae60', icon: 'check-circle',          bg: '#eafaf1' }
};

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
    const el = id => document.getElementById(id);
    if (el('laundry-needed-count'))  el('laundry-needed-count').textContent  = list.filter(c => getStatus(c) === 'needed').length;
    if (el('laundry-caution-count')) el('laundry-caution-count').textContent = list.filter(c => getStatus(c) === 'caution').length;
    if (el('laundry-safe-count'))    el('laundry-safe-count').textContent    = list.filter(c => getStatus(c) === 'safe').length;
    if (el('laundry-total-count'))   el('laundry-total-count').textContent   = list.length;
}

function renderByFilter(filter, userId) {
    const filtered = filter === 'all' ? allClothings
                   : allClothings.filter(c => getStatus(c) === filter);
    renderLaundryItems(filtered, userId);
}

function renderLaundryItems(list, userId) {
    const grid = document.getElementById('laundryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (list.length === 0) {
        const msgs = { needed: '세탁이 필요한 옷이 없어요! 🎉', caution: '주의 단계 의류가 없어요!', safe: '안전한 의류가 없어요.', all: '등록된 의류가 없습니다.' };
        grid.innerHTML = `<p style="padding:24px;color:#666;grid-column:1/-1;">${msgs[currentFilter] || '등록된 의류가 없습니다.'}</p>`;
        return;
    }

    list.forEach(c => {
        const status = getStatus(c);
        const cfg = STATUS_CONFIG[status];
        const threshold = getThreshold(c);
        const worn = c.wearCount || 0;
        const card = document.createElement('div');
        card.className = 'laundry-card';
        card.style.borderLeft = `4px solid ${cfg.color}`;
        card.style.background = cfg.bg;
        card.dataset.id = c.id;

        const imgHtml = c.imageUrl
            ? `<img src="${c.imageUrl}" alt="${c.category}" style="width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:10px;">`
            : `<div style="height:120px;background:#f0f4f8;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;">
                   <i class="fas fa-shirt" style="font-size:36px;color:#aaa;"></i></div>`;

        // 진행도 바
        const pct = Math.min(100, Math.round((worn / threshold) * 100));
        const barColor = cfg.color;

        card.innerHTML = `
            ${imgHtml}
            <div class="laundry-header">
                <h3>${c.color ? c.color + ' ' : ''}${c.subcategory || c.category}</h3>
                <span class="urgency-badge" style="background:${cfg.color};color:#fff;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;">
                    <i class="fas fa-${cfg.icon}"></i> ${cfg.label}
                </span>
            </div>
            <div class="laundry-info" style="margin:10px 0;">
                <div class="info-row"><strong>카테고리:</strong> <span>${c.category || '-'}</span></div>
                ${c.material ? `<div class="info-row"><strong>소재:</strong> <span>${c.material}</span></div>` : ''}
                ${c.lastWornDate ? `<div class="info-row"><strong>마지막 착용:</strong> <span>${c.lastWornDate}</span></div>` : ''}
                <div class="info-row"><strong>착용 횟수:</strong> <span>${worn}회 / 기준 ${threshold}회</span></div>
            </div>
            <div style="background:#e0e0e0;border-radius:4px;height:8px;margin:8px 0;">
                <div style="width:${pct}%;height:100%;background:${barColor};border-radius:4px;transition:width 0.4s;"></div>
            </div>
            <p style="font-size:11px;color:#888;margin-bottom:8px;text-align:right;">${pct}%</p>
            ${status === 'needed' ? `
            <button class="btn btn-mark-clean" data-id="${c.id}"
                style="width:100%;background:#27ae60;color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:600;">
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
                        if (item) { item.isInLaundry = false; item.wearCount = 0; }
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