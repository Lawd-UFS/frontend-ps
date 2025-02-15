import './index.css';
import '../../global.css';

const password = document.getElementById('password');
const visibility = document.getElementById('visibility');
//função de clique para mostrar e esconder a senha.
const visibilityPassword = () => {
  if (password.type == 'password') {
    password.type = 'text';
    visibility.src = '../../assets/images/visibility.png';
  } else {
    password.type = 'password';
    visibility.src = '../../assets/images/visibility-off.png';
  }
};

visibility.addEventListener('click', visibilityPassword);
