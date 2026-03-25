// ===== Closet Page JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
    initializeClosetPage();
});

function initializeClosetPage() {
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
    
    // Add Clothing Form Toggle
    const addClothingBtn = document.getElementById('addClothingBtn');
    const addClothingForm = document.getElementById('addClothingForm');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    
    if (addClothingBtn && addClothingForm) {
        addClothingBtn.addEventListener('click', function() {
            addClothingForm.style.display = addClothingForm.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    if (cancelAddBtn && addClothingForm) {
        cancelAddBtn.addEventListener('click', function() {
            addClothingForm.style.display = 'none';
            document.getElementById('clothingForm').reset();
        });
    }
    
    // Clothing Form Submission
    const clothingForm = document.getElementById('clothingForm');
    if (clothingForm) {
        clothingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = {
                category: document.getElementById('clothingCategory').value,
                brand: document.getElementById('clothingBrand').value,
                name: document.getElementById('clothingName').value,
                color: document.getElementById('clothingColor').value,
                price: document.getElementById('clothingPrice').value,
                purchaseDate: document.getElementById('clothingPurchaseDate').value,
                tags: document.getElementById('clothingTags').value
            };
            console.log('새 의류 등록:', formData);
            alert('의류가 등록되었습니다!');
            addClothingForm.style.display = 'none';
            clothingForm.reset();
        });
    }
    
    // Category Tab Filtering
    const categoryTabs = document.querySelectorAll('.tab-btn');
    const clothingItems = document.querySelectorAll('.clothing-item');
    
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const selectedCategory = this.getAttribute('data-category');
            clothingItems.forEach(item => {
                if (selectedCategory === 'all' || item.getAttribute('data-category') === selectedCategory) {
                    item.style.display = 'block';
                    item.style.animation = 'riseIn 0.6s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Laundry Tab Filtering
    const laundryTabs = document.querySelectorAll('.laundry-tab');
    const laundryCards = document.querySelectorAll('.laundry-card');
    
    laundryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            laundryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const selectedStatus = this.getAttribute('data-status');
            laundryCards.forEach(card => {
                if (card.classList.contains(selectedStatus)) {
                    card.style.display = 'block';
                    card.style.animation = 'riseIn 0.6s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Clothing Item Actions
    const editBtns = document.querySelectorAll('.btn-edit');
    const deleteBtns = document.querySelectorAll('.btn-delete');
    
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('의류 정보를 수정하는 기능은 추후 업데이트됩니다.');
        });
    });
    
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('이 의류를 삭제하시겠습니까?')) {
                const item = this.closest('.clothing-item');
                item.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => {
                    item.remove();
                    alert('의류가 삭제되었습니다.');
                }, 300);
            }
        });
    });
    
    // Laundry Actions
    const laundryBtns = document.querySelectorAll('.btn-laundry');
    laundryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            alert(action + ' 기능은 추후 업데이트됩니다.');
        });
    });
    
    // Smooth scroll
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

// Animation keyframe for slideUp
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
