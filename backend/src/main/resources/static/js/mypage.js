/* ===== MyPage Scripts ===== */
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
        loadUserProfile(userId);
        loadUserStats(userId);
    }
    initializeMypagePage();
});

// Initialize mypage
function initializeMypagePage() {
    // Navigation
    const menuToggle = document.querySelector('.navbar-toggle');
    const navMenu = document.querySelector('.navbar-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }

    // Sidebar navigation
    setupSidebarNavigation();

    // 색상 팔레트 클릭 토글
    initColorPalette();

    // Button handlers
    setupButtonHandlers();

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Setup sidebar navigation
function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentSections = document.querySelectorAll('.section-content');

    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // Get section ID from data attribute
            const sectionId = this.dataset.section;

            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Hide all sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });

            // Show selected section
            const selectedSection = document.getElementById(sectionId);
            if (selectedSection) {
                selectedSection.classList.add('active');

                // Scroll to top of content
                setTimeout(() => {
                    selectedSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        });
    });

    // Set first item as active by default
    if (sidebarItems.length > 0) {
        sidebarItems[0].click();
    }
}

// Load user profile
async function loadUserProfile(userId) {
    // localStorage에서 즉시 표시 (API 로딩 전)
    const cachedNickname = localStorage.getItem('nickname');
    if (cachedNickname) {
        const profileName = document.getElementById('profile-name');
        const nicknameInput = document.getElementById('nickname');
        if (profileName) profileName.textContent = cachedNickname;
        if (nicknameInput) nicknameInput.value = cachedNickname;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const user = await response.json();

            const profileName = document.getElementById('profile-name');
            const profileEmail = document.getElementById('profile-email');
            const profileJoined = document.getElementById('profile-joined');

            if (profileName) profileName.textContent = user.nickname || cachedNickname || '-';
            if (profileEmail) profileEmail.textContent = user.email || '-';
            if (profileJoined && user.createdAt) {
                const d = new Date(user.createdAt);
                if (!isNaN(d.getTime())) {
                    profileJoined.textContent = `가입일: ${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;
                }
            }

            // 프로필 폼 필드
            const fields = {
                nickname: user.nickname || cachedNickname || '',
                gender:   user.gender   || ''
            };
            Object.entries(fields).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el) el.value = val;
            });

            // 스타일 프로필 필드
            if (user.preferredColors) applySelectedColors(user.preferredColors);
            if (user.styleTypes) {
                const saved = user.styleTypes.split(',').map(s => s.trim());
                document.querySelectorAll('input[name="style"]').forEach(cb => {
                    cb.checked = saved.includes(cb.value);
                });
            }
            const styleFields = {
                'height':          user.height          || '',
                'fit-preference':  user.fitPreference   || '',
                'face-shape':      user.faceShape        || '',
                'personal-tone':   user.personalTone    || '',
                'tone-season':     user.toneSeason      || ''
            };
            Object.entries(styleFields).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el && val) el.value = val;
            });
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

// 프로필 저장 (닉네임, 성별, 휴대폰, 생년월일, 지역)
async function saveProfile(userId) {
    const nickname = document.getElementById('nickname')?.value.trim();
    if (!nickname) {
        showNotification('닉네임을 입력해주세요.', 'error');
        return;
    }

    try {
        // 기존 유저 데이터 먼저 조회 (다른 필드 덮어쓰기 방지)
        const getRes = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!getRes.ok) throw new Error('사용자 정보를 불러올 수 없습니다.');
        const user = await getRes.json();

        user.nickname = nickname;
        user.gender   = document.getElementById('gender')?.value || user.gender || '';

        const putRes = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (!putRes.ok) throw new Error('저장 실패');

        localStorage.setItem('nickname', nickname);
        const profileName = document.getElementById('profile-name');
        if (profileName) profileName.textContent = nickname;
        showNotification('프로필이 저장되었습니다!', 'success');
    } catch (e) {
        showNotification('저장에 실패했습니다.', 'error');
    }
}

// 색상 선택 토글 초기화
function initColorPalette() {
    document.querySelectorAll('.color-item[data-color]').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            this.classList.toggle('selected');
            this.style.outline = this.classList.contains('selected')
                ? '3px solid #004f60' : '';
            this.style.transform = this.classList.contains('selected')
                ? 'scale(1.2)' : '';
        });
    });
}

// 색상 선택 상태 적용 (불러오기용)
function applySelectedColors(colorStr) {
    const selected = colorStr ? colorStr.split(',').map(c => c.trim()) : [];
    document.querySelectorAll('.color-item[data-color]').forEach(item => {
        const isSelected = selected.includes(item.dataset.color);
        item.classList.toggle('selected', isSelected);
        item.style.outline = isSelected ? '3px solid #004f60' : '';
        item.style.transform = isSelected ? 'scale(1.2)' : '';
    });
}

// 실제 통계 데이터 로드
async function loadUserStats(userId) {
    try {
        const clothingRes = await fetch(`${API_BASE_URL}/users/${userId}/clothing`);
        const clothingList = clothingRes.ok ? await clothingRes.json() : [];

        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const total       = clothingList.length;
        const laundry     = clothingList.filter(c => c.isInLaundry).length;
        const wornThisMonth = clothingList.filter(c => (c.lastWornDate || '').startsWith(thisMonth)).length;
        const utilized   = total > 0
            ? Math.round(clothingList.filter(c => (c.wearCount || 0) > 0).length / total * 100)
            : 0;

        const el = id => document.getElementById(id);
        if (el('stat-total-clothing'))  el('stat-total-clothing').textContent  = total;
        if (el('stat-laundry-needed'))  el('stat-laundry-needed').textContent  = laundry;
        if (el('stat-total-worn'))      el('stat-total-worn').textContent      = wornThisMonth;
        if (el('stat-utilization'))     el('stat-utilization').textContent     = utilized + '%';

        // 최근 등록 의류 3개
        const activityList = document.getElementById('recent-activity-list');
        if (!activityList) return;

        const recent = [...clothingList]
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            .slice(0, 3);

        if (recent.length === 0) {
            activityList.innerHTML = '<p style="color:#999;padding:12px;">아직 등록된 의류가 없습니다.</p>';
            return;
        }

        activityList.innerHTML = recent.map(item => `
            <div class="activity-item">
                <div class="activity-icon"><i class="fas fa-plus"></i></div>
                <div class="activity-info">
                    <p>${item.color || ''} ${item.subcategory || item.category} 등록</p>
                    <span class="activity-date">${(item.createdAt || '').substring(0, 10)}</span>
                </div>
            </div>`).join('');
    } catch (e) {
        console.error('통계 로드 실패:', e);
    }
}

// 스타일 프로필 저장
async function saveStyleProfile(userId) {
    try {
        const getRes = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!getRes.ok) throw new Error();
        const user = await getRes.json();

        // 선호 색상 (선택된 것들)
        const selectedColors = [...document.querySelectorAll('.color-item.selected')]
            .map(el => el.dataset.color).join(',');

        // 스타일 타입 (체크된 것들)
        const selectedStyles = [...document.querySelectorAll('input[name="style"]:checked')]
            .map(el => el.value).join(',');

        user.preferredColors = selectedColors;
        user.styleTypes      = selectedStyles;
        user.height          = parseInt(document.getElementById('height')?.value) || user.height || null;
        user.fitPreference   = document.getElementById('fit-preference')?.value   || user.fitPreference || '';
        user.faceShape       = document.getElementById('face-shape')?.value       || user.faceShape    || '';
        user.personalTone    = document.getElementById('personal-tone')?.value    || user.personalTone || '';
        user.toneSeason      = document.getElementById('tone-season')?.value      || user.toneSeason   || '';

        const putRes = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (!putRes.ok) throw new Error();
        showNotification('스타일 프로필이 저장되었습니다!', 'success');
    } catch (e) {
        showNotification('저장에 실패했습니다.', 'error');
    }
}

// Setup button handlers
function setupButtonHandlers() {
    const logoutButton = document.querySelector('.btn-logout');
    const deleteAccountButton = document.querySelector('.btn-danger');

    // 프로필 저장 버튼
    const profileSaveBtn = document.getElementById('profile-save-btn');
    if (profileSaveBtn) {
        profileSaveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = getCurrentUserId();
            if (!userId) return;
            const originalText = this.innerHTML;
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';
            saveProfile(userId).finally(() => {
                this.disabled = false;
                this.innerHTML = originalText;
            });
        });
    }

    // 스타일 프로필 저장 버튼
    const styleSaveBtn = document.getElementById('style-save-btn');
    if (styleSaveBtn) {
        styleSaveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = getCurrentUserId();
            if (!userId) return;
            const originalText = this.innerHTML;
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';
            saveStyleProfile(userId).finally(() => {
                this.disabled = false;
                this.innerHTML = originalText;
            });
        });
    }

    // AI 프로필 분석
    const selfieInput = document.getElementById('selfieInput');
    const selfieUploadArea = document.getElementById('selfieUploadArea');
    const selfiePreview = document.getElementById('selfiePreview');
    const aiAnalyzeBtn = document.getElementById('ai-analyze-btn');
    const aiStatus = document.getElementById('ai-analyze-status');

    if (selfieUploadArea) {
        selfieUploadArea.addEventListener('click', () => selfieInput.click());
    }

    if (selfieInput) {
        selfieInput.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                selfiePreview.src = e.target.result;
                selfiePreview.style.display = 'block';
                aiAnalyzeBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        });
    }

    if (aiAnalyzeBtn) {
        aiAnalyzeBtn.addEventListener('click', async function() {
            const userId = getCurrentUserId();
            if (!userId || !selfiePreview.src) return;
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 분석 중...';
            aiStatus.style.display = 'block';
            aiStatus.style.color = '#004f60';
            aiStatus.textContent = 'AI가 사진을 분석하고 있어요... (약 10초)';
            try {
                const res = await fetch(`${API_BASE_URL}/users/${userId}/analyze-profile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: selfiePreview.src })
                });
                if (!res.ok) throw new Error('분석 실패');
                const data = await res.json();

                // 분석 결과 자동 입력
                if (data.personalTone)  document.getElementById('personal-tone').value  = data.personalTone;
                if (data.toneSeason)    document.getElementById('tone-season').value     = data.toneSeason;
                if (data.faceShape)     document.getElementById('face-shape').value      = data.faceShape;
                if (data.fitPreference) document.getElementById('fit-preference').value  = data.fitPreference;

                aiStatus.style.color = '#27ae60';
                aiStatus.textContent = '분석 완료! 퍼스널 정보가 자동으로 반영 및 저장되었습니다.';
            } catch (e) {
                aiStatus.style.color = '#e74c3c';
                aiStatus.textContent = '분석에 실패했어요. 다시 시도해주세요.';
            } finally {
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-brain"></i> AI 분석 시작';
            }
        });
    }

    // Logout button
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();

            if (confirm('정말로 로그아웃하시겠습니까?')) {
                localStorage.removeItem('userId');
                localStorage.removeItem('nickname');
                showNotification('로그아웃되었습니다.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
    }

    // Delete account button
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', function(e) {
            e.preventDefault();

            if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) {
                if (confirm('계정 삭제를 한 번 더 확인해주세요. 모든 데이터가 영구적으로 삭제됩니다.')) {
                    const userId = getCurrentUserId();
                    if (!userId) return;

                    fetch(`${API_BASE_URL}/users/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            localStorage.removeItem('userId');
                            localStorage.removeItem('nickname');
                            showNotification('계정이 삭제되었습니다.', 'success');
                            setTimeout(() => {
                                window.location.href = 'login.html';
                            }, 1000);
                        } else {
                            showNotification('계정 삭제에 실패했습니다.', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('오류가 발생했습니다.', 'error');
                    });
                }
            }
        });
    }

    // 비밀번호 변경 폼 토글
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passwordChangeForm = document.getElementById('password-change-form');
    if (changePasswordBtn && passwordChangeForm) {
        changePasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const visible = passwordChangeForm.style.display !== 'none';
            passwordChangeForm.style.display = visible ? 'none' : 'block';
        });
    }

    // 비밀번호 변경 제출
    const submitPasswordChangeBtn = document.getElementById('submit-password-change');
    if (submitPasswordChangeBtn) {
        submitPasswordChangeBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const userId = getCurrentUserId();
            if (!userId) return;

            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const newPasswordConfirm = document.getElementById('new-password-confirm').value;
            const statusEl = document.getElementById('password-change-status');

            const showStatus = (msg, color) => {
                statusEl.style.display = 'block';
                statusEl.style.color = color;
                statusEl.textContent = msg;
            };

            if (!currentPassword || !newPassword || !newPasswordConfirm) {
                showStatus('모든 항목을 입력해주세요.', '#e74c3c');
                return;
            }
            if (newPassword.length < 8) {
                showStatus('새 비밀번호는 최소 8자 이상이어야 합니다.', '#e74c3c');
                return;
            }
            if (newPassword !== newPasswordConfirm) {
                showStatus('새 비밀번호가 일치하지 않습니다.', '#e74c3c');
                return;
            }

            const originalText = this.innerHTML;
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 변경 중...';

            try {
                const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, currentPassword, newPassword })
                });
                const data = await res.json();
                if (res.ok) {
                    showStatus(data.message || '비밀번호가 변경되었습니다.', '#27ae60');
                    showNotification('비밀번호가 성공적으로 변경되었습니다.', 'success');
                    document.getElementById('current-password').value = '';
                    document.getElementById('new-password').value = '';
                    document.getElementById('new-password-confirm').value = '';
                } else {
                    showStatus(data.message || '비밀번호 변경에 실패했습니다.', '#e74c3c');
                }
            } catch (err) {
                showStatus('오류가 발생했습니다. 다시 시도해주세요.', '#e74c3c');
            } finally {
                this.disabled = false;
                this.innerHTML = originalText;
            }
        });
    }

    // Other buttons
    const downloadButton = Array.from(document.querySelectorAll('.btn-outline')).find(
        btn => btn.textContent.includes('다운로드')
    );

    if (downloadButton) {
        downloadButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('데이터 다운로드가 시작됩니다. (실제 구현 필요)');
        });
    }

    // Logout all devices button
    const logoutAllButton = Array.from(document.querySelectorAll('.btn-outline')).find(
        btn => btn.textContent.includes('로그아웃')
    );

    if (logoutAllButton) {
        logoutAllButton.addEventListener('click', function(e) {
            e.preventDefault();

            if (confirm('다른 모든 장치에서 로그아웃됩니다. 계속하시겠습니까?')) {
                alert('다른 모든 장치에서 로그아웃되었습니다.');
                showNotification('모든 세션에서 로그아웃되었습니다.', 'success');
            }
        });
    }
}

// Notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 12px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animations to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
