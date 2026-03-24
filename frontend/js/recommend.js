// ===== Recommend Page JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
    initializeRecommendPage();
});

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
    
    // Outfit card detail button
    const outfitBtns = document.querySelectorAll('.btn-outfit');
    outfitBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('상세 정보를 보려면 로그인이 필요합니다.');
        });
    });
}
