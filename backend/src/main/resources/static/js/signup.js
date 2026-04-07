const API_BASE_URL = 'http://localhost:8093/api';
const signupForm = document.getElementById('signupForm');
const signupStatusMessage = document.getElementById('statusMessage');
const styleError = document.getElementById('styleError');
const agreeError = document.getElementById('agreeError');

// UUID 생성 함수
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function setFieldError(input, message) {
  const errorEl = input.parentElement.querySelector('.error-message');
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function clearFieldError(input) {
  setFieldError(input, '');
}

function validateSignupForm(form) {
  let isValid = true;

  const nicknameInput = form.elements.nickname;
  const emailInput = form.elements.email;
  const passwordInput = form.elements.password;
  const confirmPasswordInput = form.elements.confirmPassword;
  const styleInputs = form.querySelectorAll('input[name="style"]:checked');
  const agreeInput = document.getElementById('agree');

  if (!nicknameInput.value.trim() || nicknameInput.value.trim().length < 2) {
    setFieldError(nicknameInput, '닉네임은 2자 이상 입력해주세요.');
    isValid = false;
  } else {
    clearFieldError(nicknameInput);
  }

  if (!emailInput.value.trim()) {
    setFieldError(emailInput, '이메일을 입력해주세요.');
    isValid = false;
  } else {
    clearFieldError(emailInput);
  }

  if (!passwordInput.value.trim()) {
    setFieldError(passwordInput, '비밀번호를 입력해주세요.');
    isValid = false;
  } else if (passwordInput.value.length < 8) {
    setFieldError(passwordInput, '비밀번호는 8자 이상이어야 합니다.');
    isValid = false;
  } else {
    clearFieldError(passwordInput);
  }

  if (!confirmPasswordInput.value.trim()) {
    setFieldError(confirmPasswordInput, '비밀번호 확인을 입력해주세요.');
    isValid = false;
  } else if (passwordInput.value !== confirmPasswordInput.value) {
    setFieldError(confirmPasswordInput, '비밀번호가 일치하지 않습니다.');
    isValid = false;
  } else {
    clearFieldError(confirmPasswordInput);
  }

  if (styleInputs.length === 0) {
    styleError.textContent = '최소 1개의 스타일을 선택해주세요.';
    isValid = false;
  } else {
    styleError.textContent = '';
  }

  if (!agreeInput.checked) {
    agreeError.textContent = '약관 동의가 필요합니다.';
    isValid = false;
  } else {
    agreeError.textContent = '';
  }

  return isValid;
}

signupForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  signupStatusMessage.textContent = '';
  signupStatusMessage.classList.remove('ok', 'error');

  if (!validateSignupForm(signupForm)) {
    signupStatusMessage.textContent = '입력값을 다시 확인해주세요.';
    signupStatusMessage.classList.add('error');
    return;
  }

  signupStatusMessage.textContent = '회원가입 처리 중입니다...';

  const signupData = {
    email: signupForm.elements.email.value,
    password: signupForm.elements.password.value,
    nickname: signupForm.elements.nickname.value
  };

  fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(signupData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.userId) {
      // localStorage에 사용자 정보 저장
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('nickname', data.nickname || '');
      localStorage.setItem('accessToken', data.accessToken || '');

      signupStatusMessage.textContent = '회원가입 완료! 옷장으로 이동합니다.';
      signupStatusMessage.classList.remove('error');
      signupStatusMessage.classList.add('ok');
      setTimeout(() => {
        window.location.href = 'closet.html';
      }, 1500);
    } else {
      throw new Error(data.message || '회원가입 실패');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    signupStatusMessage.textContent = error.message || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
    signupStatusMessage.classList.remove('ok');
    signupStatusMessage.classList.add('error');
  });
});
