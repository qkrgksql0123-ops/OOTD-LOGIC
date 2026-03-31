// ===== Closet Page JavaScript =====

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
        loadClothingList(userId);
    }
    initializeClosetPage();
});

// Load clothing list from API
async function loadClothingList(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/clothing`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const clothings = await response.json();
            renderClothingItems(clothings);
        }
    } catch (error) {
        console.error('Error loading clothing list:', error);
    }
}

// Render clothing items
function renderClothingItems(clothings) {
    const clothingGrid = document.querySelector('.clothing-grid');
    if (!clothingGrid) return;

    clothingGrid.innerHTML = '';

    if (clothings.length === 0) {
        clothingGrid.innerHTML = '<p>등록된 의류가 없습니다.</p>';
        return;
    }

    clothings.forEach(clothing => {
        const clothingItem = document.createElement('div');
        clothingItem.className = 'clothing-item';
        clothingItem.setAttribute('data-category', clothing.category);
        clothingItem.setAttribute('data-clothing-id', clothing.id);
        clothingItem.innerHTML = `
            <div class="clothing-image">
                <img src="${clothing.imageUrl || 'https://via.placeholder.com/200'}" alt="${clothing.category}">
            </div>
            <div class="clothing-info">
                <h3>${clothing.category}</h3>
                ${clothing.tags ? `<p class="tags">${clothing.tags.join(', ')}</p>` : ''}
                <div class="clothing-actions">
                    <button class="btn-edit">수정</button>
                    <button class="btn-delete">삭제</button>
                </div>
            </div>
        `;
        clothingGrid.appendChild(clothingItem);
    });

    // Re-attach event listeners to new elements
    attachClothingEventListeners();
}

// Attach event listeners to clothing items
function attachClothingEventListeners() {
    const userId = getCurrentUserId();
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
                const clothingItem = this.closest('.clothing-item');
                const clothingId = clothingItem.getAttribute('data-clothing-id');

                fetch(`${API_BASE_URL}/users/${userId}/clothing/${clothingId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        clothingItem.style.animation = 'slideUp 0.3s ease';
                        setTimeout(() => {
                            clothingItem.remove();
                            alert('의류가 삭제되었습니다.');
                        }, 300);
                    } else {
                        alert('삭제에 실패했습니다.');
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
            const userId = getCurrentUserId();

            const clothing = {
                category: document.getElementById('clothingCategory').value,
                imageUrl: '',
                color: document.getElementById('clothingColor').value,
                tags: document.getElementById('clothingTags').value.split(',').map(tag => tag.trim())
            };

            fetch(`${API_BASE_URL}/users/${userId}/clothing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clothing)
            })
            .then(response => {
                if (response.ok) {
                    alert('의류가 등록되었습니다!');
                    addClothingForm.style.display = 'none';
                    clothingForm.reset();
                    loadClothingList(userId);
                } else {
                    alert('의류 등록에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('오류가 발생했습니다.');
            });
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
