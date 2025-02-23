import './styles.css';
import personWithSmartPhone from '../../../assets/images/person-with-smartphone.png';
import { clearFieldError, setError } from '../../../pages/register/formHandler';
import { ErrorDialog } from '../../ErrorDialog';
import { openModal } from '../../../lib/modal';

export const SubmissionError = ({ hasToken, emailService, message }) => {
  const container = document.createElement('div');
  container.id = 'error';

  container.innerHTML = `
    <img
        src="${personWithSmartPhone}"
        alt="pessoa deitada mexendo no celular"
    />
    <h1>Ops! Algo deu errado...</h1>
  `;

  if (!hasToken) {
    return container;
  }

  if (!emailService) {
    if (!message) {
      return container;
    }

    const h3 = document.createElement('h3');
    h3.innerText = message;
    container.appendChild(h3);

    return container;
  }

  const label = document.createElement('label');
  label.innerText = message;
  label.classList.add('resend-email');
  label.setAttribute('for', 'email');

  const input = document.createElement('input');
  input.setAttribute('id', 'email');
  input.type = 'email';
  input.placeholder = 'Digite seu email';
  input.addEventListener('input', () => clearFieldError(input));

  const button = document.createElement('button');
  button.innerText = 'Reenviar email';

  const handleResendEmail = async () => {
    const emailValue = input.value;

    if (!emailValue) {
      setError([label]);
      return;
    }

    const response = await emailService.resendEmail(emailValue);

    if (!response.success) {
      const errorDialog = ErrorDialog([{ message: response.message }]);
      openModal(errorDialog);
    }
  };

  button.addEventListener('click', handleResendEmail);

  label.appendChild(input);
  container.appendChild(label);
  container.appendChild(button);

  return container;
};
