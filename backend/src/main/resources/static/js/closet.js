// ===== Closet Page JavaScript =====
// API_BASE_URL is defined in script.js

let currentEditingClothingId = null;

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
    updateAuthenticationUI();
    const userId = getCurrentUserId();
    if (userId) {
        loadClothingList(userId);
    }
    initializeClosetPage();
});

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
        } else {
            console.error('Failed to load clothing list');
        }
    } catch (error) {
        console.error('Error loading clothing list:', error);
    }
}

// Render clothing items
function renderClothingItems(clothings) {
    const closetGrid = document.getElementById('closetGrid');
    if (!closetGrid) return;

    // 기존 샘플 아이템 제거 (처음 로드할 때만)
    if (closetGrid.querySelectorAll('[data-clothing-id]').length === 0) {
        closetGrid.innerHTML = '';
    }

    if (clothings.length === 0) {
        if (closetGrid.innerHTML === '') {
            closetGrid.innerHTML = '<p>등록된 의류가 없습니다.</p>';
        }
        return;
    }

    clothings.forEach(clothing => {
        // 중복 확인
        if (document.querySelector(`[data-clothing-id="${clothing.id}"]`)) {
            return;
        }

        const clothingItem = document.createElement('div');
        clothingItem.className = 'clothing-item';
        clothingItem.setAttribute('data-category', clothing.category);
        clothingItem.setAttribute('data-clothing-id', clothing.id);

        clothingItem.innerHTML = `
            <div class="item-image">
                <img src="${clothing.imageUrl || 'https://via.placeholder.com/200'}" alt="${clothing.subcategory || clothing.category}" style="width: 100%; height: 200px; object-fit: cover;">
            </div>
            <div class="item-info">
                <h3>${clothing.subcategory || clothing.category}</h3>
                <p class="brand">${clothing.material || '소재 정보 없음'}</p>
                <p class="color">색상: ${clothing.color || '미지정'}</p>
                <div class="item-stats">
                    <span><i class="fas fa-redo"></i> ${clothing.wearCount || 0}회</span>
                    <span><i class="fas fa-calendar"></i> ${clothing.createdAt?.substring(0, 10) || '미지정'}</span>
                </div>
                ${clothing.tags && clothing.tags.length > 0 ? `<p class="tags">${clothing.tags.join(', ')}</p>` : ''}
                <div class="item-actions">
                    <button class="btn-small btn-edit" data-clothing-id="${clothing.id}">수정</button>
                    <button class="btn-small btn-delete" data-clothing-id="${clothing.id}">삭제</button>
                </div>
            </div>
        `;
        closetGrid.appendChild(clothingItem);
    });

    // 이벤트 리스너 다시 연결
    attachClothingEventListeners();
}

// Attach event listeners to clothing items
function attachClothingEventListeners() {
    const userId = getCurrentUserId();
    const editBtns = document.querySelectorAll('.btn-edit');
    const deleteBtns = document.querySelectorAll('.btn-delete');

    editBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const clothingId = this.getAttribute('data-clothing-id');
            openEditForm(userId, clothingId);
        });
    });

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const clothingId = this.getAttribute('data-clothing-id');
            const clothingItem = this.closest('.clothing-item');

            if (confirm('이 의류를 정말 삭제하시겠습니까?')) {
                deleteClothing(userId, clothingId, clothingItem);
            }
        });
    });
}

// 수정 폼 열기
function openEditForm(userId, clothingId) {
    const clothingItem = document.querySelector(`[data-clothing-id="${clothingId}"]`);
    if (!clothingItem) return;

    // 현재 정보 추출
    const info = {
        id: clothingId,
        category: clothingItem.getAttribute('data-category'),
        subcategory: clothingItem.querySelector('h3').textContent,
        color: clothingItem.querySelector('.color').textContent.replace('색상: ', ''),
        material: clothingItem.querySelector('.brand').textContent,
        imageUrl: clothingItem.querySelector('img').src,
        tags: clothingItem.querySelector('.tags')?.textContent.split(', ') || []
    };

    // 폼에 데이터 채우기
    currentEditingClothingId = clothingId;
    document.getElementById('clothingCategory').value = info.category;
    document.getElementById('clothingSubcategory').value = info.subcategory;
    document.getElementById('clothingColor').value = info.color;
    document.getElementById('clothingMaterial').value = info.material;
    document.getElementById('clothingTags').value = info.tags.join(', ');

    // 이미지 미리보기
    const preview = document.getElementById('imagePreview');
    preview.src = info.imageUrl;
    preview.style.display = 'block';

    // 폼 열기
    const addClothingForm = document.getElementById('addClothingForm');
    addClothingForm.style.display = 'block';

    // 버튼 텍스트 변경
    const submitBtn = document.querySelector('#clothingForm button[type="submit"]');
    submitBtn.textContent = '수정하기';

    // 맨 위로 스크롤
    addClothingForm.scrollIntoView({ behavior: 'smooth' });
}

// Delete clothing
function deleteClothing(userId, clothingId, clothingItem) {
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
        link.addEventListener('click', function() {
            if (navbarMenu) {
                navbarMenu.classList.remove('active');
            }
        });
    });

    // Add Clothing Form Toggle
    const addClothingBtn = document.getElementById('addClothingBtn');
    const addClothingForm = document.getElementById('addClothingForm');
    const cancelAddBtn = document.getElementById('cancelAddBtn');

    console.log('addClothingBtn:', addClothingBtn);
    console.log('addClothingForm:', addClothingForm);

    if (addClothingBtn && addClothingForm) {
        addClothingBtn.addEventListener('click', function(e) {
            console.log('버튼 클릭됨');
            e.preventDefault();
            currentEditingClothingId = null;
            document.querySelector('#clothingForm button[type="submit"]').textContent = '등록하기';
            addClothingForm.style.display = addClothingForm.style.display === 'none' ? 'block' : 'none';
            if (addClothingForm.style.display === 'block') {
                document.getElementById('clothingForm').reset();
                document.getElementById('imagePreview').style.display = 'none';
            }
        });
        console.log('✅ 버튼 이벤트 리스너 설정 완료');
    } else {
        console.error('❌ 버튼 또는 폼을 찾을 수 없음');
    }

    if (cancelAddBtn && addClothingForm) {
        cancelAddBtn.addEventListener('click', function() {
            addClothingForm.style.display = 'none';
            document.getElementById('clothingForm').reset();
            document.getElementById('imagePreview').style.display = 'none';
            currentEditingClothingId = null;
            document.querySelector('#clothingForm button[type="submit"]').textContent = '등록하기';
        });
    }

    // Image Upload Preview
    const clothingImageInput = document.getElementById('clothingImage');
    const imagePreview = document.getElementById('imagePreview');
    const imageUploadArea = document.getElementById('imageUploadArea');

    if (clothingImageInput) {
        clothingImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagePreview.src = event.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 드래그 앤 드롭
    if (imageUploadArea) {
        imageUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.backgroundColor = '#f0f0f0';
        });

        imageUploadArea.addEventListener('dragleave', function() {
            this.style.backgroundColor = 'transparent';
        });

        imageUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.backgroundColor = 'transparent';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                clothingImageInput.files = files;
                const event = new Event('change', { bubbles: true });
                clothingImageInput.dispatchEvent(event);
            }
        });
    }

    // Clothing Form Submission
    const clothingForm = document.getElementById('clothingForm');
    if (clothingForm) {
        clothingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userId = getCurrentUserId();
            const imageInput = document.getElementById('clothingImage');

            // 이미지 파일 처리
            if (!currentEditingClothingId && !imageInput.files.length) {
                alert('옷 사진을 선택해주세요.');
                return;
            }

            if (imageInput.files.length > 0) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const imageUrl = event.target.result; // Base64
                    submitClothingForm(userId, imageUrl);
                };
                reader.readAsDataURL(imageInput.files[0]);
            } else {
                // 수정 시 기존 이미지 사용
                const imagePreview = document.getElementById('imagePreview');
                submitClothingForm(userId, imagePreview.src);
            }
        });
    }

    // Category Tab Filtering
    const categoryTabs = document.querySelectorAll('.tab-btn');
    const closetGrid = document.getElementById('closetGrid');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const selectedCategory = this.getAttribute('data-category');
            const clothingItems = closetGrid.querySelectorAll('.clothing-item');

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
}

function submitClothingForm(userId, imageUrl) {
    const tags = document.getElementById('clothingTags').value
        ? document.getElementById('clothingTags').value.split(',').map(tag => tag.trim())
        : [];

    const clothing = {
        category: document.getElementById('clothingCategory').value,
        subcategory: document.getElementById('clothingSubcategory').value,
        color: document.getElementById('clothingColor').value,
        material: document.getElementById('clothingMaterial').value,
        season: document.getElementById('clothingSeason').value,
        thickness: document.getElementById('clothingThickness').value ? parseInt(document.getElementById('clothingThickness').value) : null,
        imageUrl: imageUrl,
        tags: tags,
        isInLaundry: false
    };

    const url = currentEditingClothingId
        ? `${API_BASE_URL}/users/${userId}/clothing/${currentEditingClothingId}`
        : `${API_BASE_URL}/users/${userId}/clothing`;

    const method = currentEditingClothingId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(clothing)
    })
    .then(response => {
        if (response.ok) {
            const message = currentEditingClothingId ? '의류가 수정되었습니다!' : '의류가 등록되었습니다!';
            alert(message);
            document.getElementById('addClothingForm').style.display = 'none';
            document.getElementById('clothingForm').reset();
            document.getElementById('imagePreview').style.display = 'none';
            currentEditingClothingId = null;
            document.querySelector('#clothingForm button[type="submit"]').textContent = '등록하기';
            loadClothingList(userId);
        } else {
            alert('작업에 실패했습니다.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    });
}

// Animation keyframe
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

    @keyframes riseIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .image-upload-area {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 30px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background-color: #fafafa;
    }

    .image-upload-area:hover {
        border-color: #2196F3;
        background-color: #f0f8ff;
    }

    .image-upload-area input[type="file"] {
        display: none;
    }

    .upload-placeholder {
        pointer-events: none;
    }

    .upload-placeholder i {
        font-size: 48px;
        color: #999;
        display: block;
        margin-bottom: 10px;
    }

    .upload-placeholder p {
        margin: 5px 0;
        color: #666;
    }

    .upload-hint {
        font-size: 12px;
        color: #999;
    }
`;
document.head.appendChild(style);
