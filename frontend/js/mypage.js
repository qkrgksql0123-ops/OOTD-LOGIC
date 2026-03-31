/* ===== MyPage Scripts ===== */
// API_BASE_URL is defined in api.js

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
        loadUserProfile(userId);
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
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const user = await response.json();
            // Fill form fields with user data
            const nicknameInput = document.querySelector('input[placeholder*="닉네임"]');
            const emailInput = document.querySelector('input[placeholder*="이메일"]');
            const tempSlider = document.getElementById('tempSensitivity');
            const skinToneSelect = document.getElementById('skinTone');

            if (nicknameInput) nicknameInput.value = user.nickname || '';
            if (emailInput) emailInput.value = user.email || '';
            if (tempSlider) tempSlider.value = user.tempSensitivity || 5;
            if (skinToneSelect) skinToneSelect.value = user.skinTone || '';
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

// Setup button handlers
function setupButtonHandlers() {
    const saveButtons = document.querySelectorAll('.btn-primary');
    const logoutButton = document.querySelector('.btn-logout');
    const deleteAccountButton = document.querySelector('.btn-danger');
    const editPasswordButton = document.querySelectorAll('.btn-secondary')[0];

    // Save buttons
    saveButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const sectionContent = this.closest('.section-content');
            const sectionTitle = sectionContent ? sectionContent.querySelector('h2').textContent : '정보';
            const userId = getCurrentUserId();

            if (!userId) return;

            // Get form data
            const tempSensitivity = document.getElementById('tempSensitivity').value;
            const skinTone = document.getElementById('skinTone').value;

            // Send to API
            fetch(`${API_BASE_URL}/users/${userId}/settings?tempSensitivity=${tempSensitivity}&skinTone=${skinTone}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    showNotification(`${sectionTitle}가 저장되었습니다!`, 'success');

                    // Animate button
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i> 저장 완료!';
                    this.style.background = 'linear-gradient(138deg, #27ae60, #229954)';

                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.style.background = '';
                    }, 2000);
                } else {
                    showNotification('저장에 실패했습니다.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('오류가 발생했습니다.', 'error');
            });
        });
    });

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

    // Edit password button
    if (editPasswordButton) {
        editPasswordButton.addEventListener('click', function(e) {
            e.preventDefault();

            const currentPassword = prompt('현재 비밀번호를 입력하세요:');
            if (!currentPassword) return;

            const newPassword = prompt('새로운 비밀번호를 입력하세요:');
            if (!newPassword) return;

            const confirmPassword = prompt('새로운 비밀번호를 다시 입력하세요:');
            if (!confirmPassword) return;

            if (newPassword !== confirmPassword) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }

            if (newPassword.length < 8) {
                alert('비밀번호는 최소 8자 이상이어야 합니다.');
                return;
            }

            alert('비밀번호가 변경되었습니다.');
            showNotification('비밀번호가 성공적으로 변경되었습니다.', 'success');
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
