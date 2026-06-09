// ===== Closet Page JavaScript =====
// API_BASE_URL is defined in script.js

let currentEditingClothingId = null;

function showImagePreview(src) {
    const imagePreview = document.getElementById('imagePreview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    if (imagePreview) { imagePreview.src = src; imagePreview.style.display = 'block'; }
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
}

function resetImagePreview() {
    const imagePreview = document.getElementById('imagePreview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    if (imagePreview) { imagePreview.src = ''; imagePreview.style.display = 'none'; }
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
}

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
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/users/${userId}/clothing`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const clothings = await response.json();
            renderClothingItems(clothings);
        } else {
            console.error('Failed to load clothing list:', response.status);
        }
    } catch (error) {
        console.error('Error loading clothing list:', error);
    }
}

// Render clothing items
function renderClothingItems(clothings) {
    const closetGrid = document.getElementById('closetGrid');
    if (!closetGrid) return;

    closetGrid.innerHTML = '';

    if (clothings.length === 0) {
        closetGrid.innerHTML = '<p>등록된 의류가 없습니다.</p>';
        return;
    }

    clothings.forEach(clothing => {
        const clothingItem = document.createElement('div');
        clothingItem.className = 'clothing-item';
        clothingItem.setAttribute('data-category', clothing.category);
        clothingItem.setAttribute('data-clothing-id', clothing.id);
        clothingItem.setAttribute('data-season', clothing.season || '');
        clothingItem.setAttribute('data-thickness', clothing.thickness || '');

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

    const tc = document.getElementById('totalCount');
    if (tc) tc.textContent = clothings.length;
    updateClosetStats(clothings);
    renderWearingHistory(clothings);
    attachClothingEventListeners();
}

// 옷장 현황 통계 업데이트
function updateClosetStats(clothings) {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 이번달 착용: lastWornDate가 이번달인 항목 수
    const wornThisMonth = clothings.filter(c => (c.lastWornDate || '').startsWith(thisMonth)).length;

    // 세탁예정: isInLaundry = true 항목 수
    const laundryPending = clothings.filter(c => c.isInLaundry).length;

    // 활용도: 한 번이라도 착용한 옷 비율
    const total = clothings.length;
    const utilization = total > 0
        ? Math.round(clothings.filter(c => (c.wearCount || 0) > 0).length / total * 100)
        : 0;

    const el1 = document.getElementById('wornThisMonth');
    const el2 = document.getElementById('laundryPending');
    const el3 = document.getElementById('utilization');
    if (el1) el1.textContent = wornThisMonth;
    if (el2) el2.textContent = laundryPending;
    if (el3) el3.textContent = utilization + '%';
}

// 착용 기록 TOP 5 렌더링
function renderWearingHistory(clothings) {
    const container = document.getElementById('wearingHistoryList');
    if (!container) return;

    const worn = clothings
        .filter(c => (c.wearCount || 0) > 0)
        .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
        .slice(0, 5);

    if (worn.length === 0) {
        container.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">아직 착용 기록이 없습니다. AI 코디 추천에서 착용 완료를 눌러보세요!</p>';
        return;
    }

    container.innerHTML = worn.map((item, i) => {
        const imgHtml = item.imageUrl
            ? `<img src="${item.imageUrl}" style="width:52px;height:52px;object-fit:cover;border-radius:8px;flex-shrink:0;">`
            : `<div style="width:52px;height:52px;background:#f0f4f8;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-shirt" style="color:#aaa;font-size:20px;"></i></div>`;
        const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
        return `
        <div style="display:flex;align-items:center;gap:14px;padding:12px 16px;background:#f8f9fa;border-radius:10px;margin-bottom:8px;">
            <span style="font-size:20px;min-width:28px;text-align:center;">${medals[i]}</span>
            ${imgHtml}
            <div style="flex:1;min-width:0;">
                <p style="font-weight:600;margin:0;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.color || ''} ${item.subcategory || item.category}</p>
                <p style="color:#888;font-size:12px;margin:2px 0;">마지막 착용: ${item.lastWornDate || '기록 없음'}</p>
            </div>
            <span style="background:#004f60;color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700;white-space:nowrap;">${item.wearCount}회</span>
        </div>`;
    }).join('');
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
        season: clothingItem.getAttribute('data-season'),
        thickness: clothingItem.getAttribute('data-thickness'),
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
    document.getElementById('clothingSeason').value = info.season || '';
    document.getElementById('clothingThickness').value = info.thickness || '';
    document.getElementById('clothingTags').value = info.tags.join(', ');

    // 이미지 미리보기
    showImagePreview(info.imageUrl);

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
    const token = localStorage.getItem('accessToken');
    fetch(`${API_BASE_URL}/users/${userId}/clothing/${clothingId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
                resetImagePreview();
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
            resetImagePreview();
            currentEditingClothingId = null;
            document.querySelector('#clothingForm button[type="submit"]').textContent = '등록하기';
        });
    }

    // Image Upload Preview
    const clothingImageInput = document.getElementById('clothingImage');
    const imageUploadArea = document.getElementById('imageUploadArea');

    if (clothingImageInput) {
        clothingImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) { showImagePreview(event.target.result); };
                reader.readAsDataURL(file);
            }
        });
    }

    if (imageUploadArea) {
        imageUploadArea.addEventListener('click', function(e) {
            if (e.target !== clothingImageInput) clothingImageInput.click();
        });

        imageUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#2196F3';
            this.style.backgroundColor = '#f0f8ff';
        });

        imageUploadArea.addEventListener('dragleave', function() {
            this.style.borderColor = '#ccc';
            this.style.backgroundColor = '#fafafa';
        });

        imageUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ccc';
            this.style.backgroundColor = '#fafafa';
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
            console.log('✅ 폼 제출 이벤트 작동!');
            const userId = getCurrentUserId();
            const imageInput = document.getElementById('clothingImage');

            console.log('이미지 파일 개수:', imageInput.files.length);
            console.log('currentEditingClothingId:', currentEditingClothingId);

            // 이미지 파일 처리
            if (!currentEditingClothingId && !imageInput.files.length) {
                alert('옷 사진을 선택해주세요.');
                return;
            }

            if (imageInput.files.length > 0) {
                const formData = new FormData();
                formData.append('file', imageInput.files[0]);
                const btn = clothingForm.querySelector('button[type="submit"]');
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 업로드 중...';
                fetch(`${API_BASE_URL}/users/${userId}/clothing/upload-image`, {
                    method: 'POST',
                    body: formData
                })
                .then(res => {
                    if (!res.ok) throw new Error('이미지 업로드 실패');
                    return res.json();
                })
                .then(data => {
                    console.log('S3 업로드 완료:', data.imageUrl);
                    submitClothingForm(userId, data.imageUrl);
                })
                .catch(err => {
                    console.error('이미지 업로드 오류:', err);
                    alert('이미지 업로드에 실패했습니다: ' + err.message);
                    btn.disabled = false;
                    btn.innerHTML = currentEditingClothingId ? '수정하기' : '등록하기';
                });
            } else {
                // 수정 시 기존 이미지 사용
                const imagePreview = document.getElementById('imagePreview');
                console.log('기존 이미지 사용:', imagePreview.src);
                submitClothingForm(userId, imagePreview.src);
            }
        });
    } else {
        console.error('❌ clothingForm을 찾을 수 없습니다!');
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

}

function submitClothingForm(userId, imageUrl) {
    console.log('submitClothingForm 호출됨');

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

    console.log('API 요청:', {
        method: method,
        url: url,
        clothing: clothing
    });

    const token = localStorage.getItem('accessToken');

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clothing)
    })
    .then(response => {
        console.log('응답 받음:', response.status, response);
        if (response.ok) {
            return response.json().then(data => {
                console.log('응답 데이터:', data);
                const message = currentEditingClothingId ? '의류가 수정되었습니다!' : '의류가 등록되었습니다!';
                alert(message);
                document.getElementById('addClothingForm').style.display = 'none';
                document.getElementById('clothingForm').reset();
                resetImagePreview();
                currentEditingClothingId = null;
                document.querySelector('#clothingForm button[type="submit"]').textContent = '등록하기';
                console.log('옷 목록 재로드 시작');
                loadClothingList(userId);
            });
        } else {
            return response.json().then(err => {
                console.error('서버 에러:', response.status, err);
                alert('작업에 실패했습니다: ' + (err.message || response.status));
            });
        }
    })
    .catch(error => {
        console.error('❌ 네트워크 에러:', error);
        alert('오류가 발생했습니다: ' + error.message);
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

    #imagePreview {
        display: block;
        max-width: 100%;
        max-height: 240px;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 8px;
        margin: 0 auto;
    }
`;
document.head.appendChild(style);
