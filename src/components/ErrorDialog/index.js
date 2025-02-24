import { closeModal } from '../../lib/modal';

export const ErrorDialog = (errors, onClose) => {
  const modal = document.createElement('div');
  modal.classList.add('modal');

  const errorDialog = document.createElement('dialog');
  errorDialog.classList.add('error-dialog', 'closing');

  const errorTitle = document.createElement('h2');
  errorTitle.textContent = 'Erro na submissão';

  const errorList = document.createElement('ul');
  errorList.classList.add('error-list');

  if (Array.isArray(errors)) {
    errors.forEach((error) => {
      const errorItem = document.createElement('li');
      errorItem.textContent = error.message;
      errorList.appendChild(errorItem);
    });
  } else {
    const errorItem = document.createElement('li');
    errorItem.textContent = 'Ocorreu um erro no servidor, tente novamente.';
    errorList.appendChild(errorItem);
  }

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Fechar';
  closeButton.addEventListener('click', () => closeModal(errorDialog, onClose));

  modal.appendChild(errorTitle);
  modal.appendChild(errorList);
  modal.appendChild(closeButton);

  errorDialog.appendChild(modal);

  document.body.appendChild(errorDialog);

  return errorDialog;
};
