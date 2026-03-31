/* ===== Laundry Page Scripts ===== */

const API_BASE_URL = 'http://localhost:8090/api';

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
    const laundryGrid = document.querySelector('.laundry-items');
    if (!laundryGrid) return;

    laundryGrid.innerHTML = '';

    // Filter only items in laundry
    const laundryItems = clothings.filter(c => c.isInLaundry === true);

    if (laundryItems.length === 0) {
        laundryGrid.innerHTML = '<p>세탁 중인 의류가 없습니다.</p>';
        return;
    }

    laundryItems.forEach(clothing => {
        const card = document.createElement('div');
        card.className = 'laundry-card in-laundry';
        card.setAttribute('data-clothing-id', clothing.id);
        card.innerHTML = `
            <div class="laundry-image">
                <img src="${clothing.imageUrl || 'https://via.placeholder.com/200'}" alt="${clothing.category}">
            </div>
            <div class="laundry-info">
                <h3>${clothing.category}</h3>
                ${clothing.tags ? `<p class="tags">${clothing.tags.join(', ')}</p>` : ''}
                <div class="laundry-actions">
                    <button class="btn-mark-clean">세탁 완료</button>
                    <button class="btn-laundry-record">세탁 기록</button>
                </div>
            </div>
        `;
        laundryGrid.appendChild(card);
    });

    // Re-attach event listeners to new elements
    attachLaundryEventListeners();
}

// Attach event listeners to laundry items
function attachLaundryEventListeners() {
    const userId = getCurrentUserId();
    const markCleanBtns = document.querySelectorAll('.btn-mark-clean');

    markCleanBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('세탁이 완료되었습니까?')) {
                const card = this.closest('.laundry-card');
                const clothingId = card.getAttribute('data-clothing-id');
                const itemName = card.querySelector('h3').textContent;

                fetch(`${API_BASE_URL}/users/${userId}/clothing/${clothingId}/laundry-status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ isInLaundry: false })
                })
                .then(response => {
                    if (response.ok) {
                        alert(`"${itemName}"을(를) 세탁 완료로 표시했습니다.`);
                        card.style.animation = 'slideUp 0.5s ease forwards';
                        setTimeout(() => {
                            card.remove();
                        }, 500);
                    } else {
                        alert('업데이트 실패');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('오류가 발생했습니다.');
                });
            }
        });
    });
}

// Initialize laundry page
function initializeLaundryPage() {
    // Navigation
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

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

    // Laundry tabs
    setupLaundryTabs();

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

// Setup laundry tabs
function setupLaundryTabs() {
    const tabs = document.querySelectorAll('.laundry-tab');
    const cards = document.querySelectorAll('.laundry-card');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');

            // Get status filter from data-status attribute
            const filter = this.dataset.status || this.dataset.filter;

            // Filter cards
            cards.forEach(card => {
                if (filter === 'all') {
                    // Show all cards
                    card.style.display = 'block';
                    // Trigger animation
                    card.style.animation = 'none';
                    setTimeout(() => {
                        card.style.animation = 'riseIn 0.6s ease';
                    }, 10);
                } else {
                    // Show only cards with matching class
                    if (card.classList.contains(filter)) {
                        card.style.display = 'block';
                        // Trigger animation
                        card.style.animation = 'none';
                        setTimeout(() => {
                            card.style.animation = 'riseIn 0.6s ease';
                        }, 10);
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });

    // Set first tab as active by default
    if (tabs.length > 0) {
        tabs[0].classList.add('active');
    }
}

// Add slideUp animation to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);
