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
  const passwordInput = form.elements.password;

  let isValid = true;

  if (!emailInput.value.trim()) {
    setFieldError(emailInput, '이메일을 입력해주세요.');
    isValid = false;
  } else {
    clearFieldError(emailInput);
  }

  if (!passwordInput.value.trim()) {
    setFieldError(passwordInput, '비밀번호를 입력해주세요.');
    isValid = false;
  } else {
    clearFieldError(passwordInput);
  }

  return isValid;
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  statusMessage.textContent = '';
  statusMessage.classList.remove('ok', 'error');

  if (!validateLoginForm(loginForm)) {
    statusMessage.textContent = '입력값을 확인해주세요.';
    statusMessage.classList.add('error');
    return;
  }

  statusMessage.textContent = '로그인 중입니다...';

  try {
    const email = loginForm.elements.email.value;
    const password = loginForm.elements.password.value;

    const data = await login(email, password);

    if (data.userId && data.accessToken && data.refreshToken) {
      statusMessage.textContent = '로그인 성공! 메인 페이지로 이동합니다.';
      statusMessage.classList.remove('error');
      statusMessage.classList.add('ok');

      setTimeout(() => {
        window.location.href = 'closet.html';
      }, 1500);
    } else {
      throw new Error(data.message || '로그인 실패');
    }
  } catch (error) {
    console.error('Login error:', error);
    statusMessage.textContent = error.message || '로그인 중 오류가 발생했습니다.';
    statusMessage.classList.remove('ok');
    statusMessage.classList.add('error');
  }
});
