/* ===== Laundry Page Scripts ===== */

document.addEventListener('DOMContentLoaded', function() {
    initializeLaundryPage();
});

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

    // Button handlers
    setupLaundryButtons();
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

// Setup laundry buttons
function setupLaundryButtons() {
    const buttons = document.querySelectorAll('.btn-mark-clean');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const card = this.closest('.laundry-card');
            const itemName = card.querySelector('h3').textContent;
            const buttonText = this.textContent;

            if (buttonText.includes('세탁 완료')) {
                // Mark as clean
                alert(`"${itemName}"을(를) 세탁 완료로 표시했습니다.`);
                
                // Animate removal
                card.style.animation = 'slideUp 0.5s ease forwards';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 500);
            } else if (buttonText.includes('세탁 기록')) {
                // Record wash
                alert(`"${itemName}"에 대한 세탁 기록을 저장했습니다.`);
            }
        });
    });
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
