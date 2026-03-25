const API_BASE_URL = 'http://localhost:8080/api';
const loginForm = document.getElementById('loginForm');
const statusMessage = document.getElementById('statusMessage');

function setFieldError(input, message) {
  const errorEl = input.parentElement.querySelector('.error-message');
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function clearFieldError(input) {
  setFieldError(input, '');
}

function validateLoginForm(form) {
  const emailInput = form.elements.email;

  let isValid = true;

  if (!emailInput.value.trim()) {
    setFieldError(emailInput, '이메일을 입력해주세요.');
    isValid = false;
  } else {
    clearFieldError(emailInput);
  }

  return isValid;
}

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  statusMessage.textContent = '';
  statusMessage.classList.remove('ok', 'error');

  if (!validateLoginForm(loginForm)) {
    statusMessage.textContent = '입력값을 확인해주세요.';
    statusMessage.classList.add('error');
    return;
  }

  statusMessage.textContent = '로그인 중입니다...';

  const email = loginForm.elements.email.value;

  fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else if (response.status === 404) {
      throw new Error('등록되지 않은 이메일입니다.');
    } else {
      throw new Error('로그인 실패');
    }
  })
  .then(user => {
    localStorage.setItem('userId', user.userId);
    localStorage.setItem('nickname', user.nickname || '');
    statusMessage.textContent = '로그인 성공! 메인 페이지로 이동합니다.';
    statusMessage.classList.remove('error');
    statusMessage.classList.add('ok');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  })
  .catch(error => {
    console.error('Error:', error);
    statusMessage.textContent = error.message;
    statusMessage.classList.remove('ok');
    statusMessage.classList.add('error');
  });
});
