import './index.css';

import visibilityOn from '../../assets/images/visibility.png';
import visibilityOff from '../../assets/images/visibility-off.png';

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
