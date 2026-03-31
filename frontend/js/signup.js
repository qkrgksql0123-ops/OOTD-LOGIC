const signupForm = document.getElementById('signupForm');
const signupStatusMessage = document.getElementById('statusMessage');
const styleError = document.getElementById('styleError');
const agreeError = document.getElementById('agreeError');

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

  if (!agreeInput.checked) {
    agreeError.textContent = '약관 동의가 필요합니다.';
    isValid = false;
  } else {
    agreeError.textContent = '';
  }

  return isValid;
}

signupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  signupStatusMessage.textContent = '';
  signupStatusMessage.classList.remove('ok', 'error');

  if (!validateSignupForm(signupForm)) {
    signupStatusMessage.textContent = '입력값을 다시 확인해주세요.';
    signupStatusMessage.classList.add('error');
    return;
  }

  signupStatusMessage.textContent = '회원가입 처리 중입니다...';

  try {
    const email = signupForm.elements.email.value;
    const password = signupForm.elements.password.value;
    const nickname = signupForm.elements.nickname.value;

    const data = await signup(email, password, nickname);

    if (data.userId && data.accessToken && data.refreshToken) {
      signupStatusMessage.textContent = '회원가입 완료! 메인 페이지로 이동합니다.';
      signupStatusMessage.classList.remove('error');
      signupStatusMessage.classList.add('ok');

      setTimeout(() => {
        window.location.href = 'closet.html';
      }, 1500);
    } else {
      throw new Error(data.message || '회원가입 실패');
    }
  } catch (error) {
    console.error('Signup error:', error);
    signupStatusMessage.textContent = error.message || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
    signupStatusMessage.classList.remove('ok');
    signupStatusMessage.classList.add('error');
  }
});
