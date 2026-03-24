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
  } else if (passwordInput.value.length < 8) {
    setFieldError(passwordInput, '비밀번호는 8자 이상이어야 합니다.');
    isValid = false;
  } else {
    clearFieldError(passwordInput);
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

  setTimeout(() => {
    statusMessage.textContent = '로그인 성공! 메인 페이지로 이동합니다.';
    statusMessage.classList.remove('error');
    statusMessage.classList.add('ok');
  }, 700);
});
