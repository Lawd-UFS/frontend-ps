import './index.css';

const verifyEmail = async (token) => {
  const loadingState = document.getElementById('loading-state');
  const successState = document.getElementById('success-state');
  const errorState = document.getElementById('error-state');
  const errorMessage = document.getElementById('error-message');

  try {
    const response = await fetch(
      `${process.env.API_URL}/verificar-email?token=${encodeURIComponent(token)}`,
      { method: 'POST' },
    );

    const data = await response.json();

    loadingState.style.display = 'none';

    if (response.ok) {
      successState.style.display = 'flex';
    } else {
      errorMessage.textContent =
        data.message || 'O link de confirmação é inválido ou expirou.';
      errorState.style.display = 'flex';
    }
  } catch {
    loadingState.style.display = 'none';
    errorMessage.textContent = 'Erro de conexão. Tente novamente mais tarde.';
    errorState.style.display = 'flex';
  }
};

const init = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-message').textContent =
      'Token de verificação não encontrado.';
    document.getElementById('error-state').style.display = 'flex';
    return;
  }

  verifyEmail(token);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
