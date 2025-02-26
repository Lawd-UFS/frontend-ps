import { authenticate, isAuthenticated } from '../../lib/authenticator';

if (isAuthenticated()) {
  window.location.href = '/schedule';
}

import './index.css';
import visibilityOn from '../../assets/images/visibility.png';
import visibilityOff from '../../assets/images/visibility-off.png';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  const emailLabel = document.querySelector('label[for="email"]');
  const passwordLabel = document.querySelector('label[for="password"]');

  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const visibility = document.getElementById('visibility');
  //função de clique para mostrar e esconder a senha.
  const visibilityPassword = () => {
    if (password.type == 'password') {
      password.type = 'text';
      visibility.src = visibilityOn;
    } else {
      password.type = 'password';
      visibility.src = visibilityOff;
    }
  };

  visibility.addEventListener('click', visibilityPassword);

  email.addEventListener('focus', () => {
    emailLabel.classList.remove('error');
    email.classList.remove('error');
  });

  password.addEventListener('focus', () => {
    passwordLabel.classList.remove('error');
    password.classList.remove('error');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const result = await authenticate(
      formData.get('email'),
      formData.get('password'),
    );

    if (result.success) {
      window.location.href = '/schedule';
      return;
    }

    if (result.message === 'E-mail inválido!') {
      emailLabel.classList.add('error');
      email.classList.add('error');
      return;
    }

    if (result.message === 'Senha inválida!') {
      passwordLabel.classList.add('error');
      password.classList.add('error');
      return;
    }
  });
});
