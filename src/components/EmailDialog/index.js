import emailSvg from '../../assets/images/email.svg';
import { closeModal } from '../../lib/modal';

export const EmailDialog = () => {
  const dialog = document.createElement('dialog');
  dialog.id = 'emailDialog';

  dialog.innerHTML = `
      <div class="modal">
        <img
          width="87px;"
          src="data:image/svg+xml;utf8,${encodeURIComponent(emailSvg)}"
          alt="Ilustração de uma mão segurando uma carta"
        />
        <h2>Verifique seu email!</h2>
        <p>Enviamos um link de confirmação para sua conta.</p>
        <div class="buttons">
          <button id="closeEmailDialog" class="second-button">
            Fechar
          </button>
        </div>
      </div>
  `;

  document.body.appendChild(dialog);

  dialog
    .querySelector('#closeEmailDialog')
    .addEventListener('click', () => closeModal(dialog));

  return dialog;
};
