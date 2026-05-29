import { closeModal, openModal } from '../../lib/modal';
import './styles.css';

export const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  const modal = document.createElement('div');
  modal.classList.add('modal-content');

  const confirmDialog = document.createElement('dialog');
  confirmDialog.classList.add('confirm-dialog');

  const modalTitle = document.createElement('h2');
  modalTitle.textContent = title || 'Confirmação';

  const modalMessage = document.createElement('p');
  modalMessage.textContent = message || 'Tem certeza que deseja continuar?';

  const actions = document.createElement('div');
  actions.classList.add('modal-actions');

  const cancelButton = document.createElement('button');
  cancelButton.classList.add('btn-cancel');
  cancelButton.textContent = 'Cancelar';
  cancelButton.addEventListener('click', () => {
    closeModal(confirmDialog, () => {
      if (onCancel) onCancel();
      confirmDialog.remove();
    });
  });

  const confirmButton = document.createElement('button');
  confirmButton.classList.add('btn-confirm');
  confirmButton.textContent = 'Confirmar';
  confirmButton.addEventListener('click', () => {
    closeModal(confirmDialog, () => {
      if (onConfirm) onConfirm();
      confirmDialog.remove();
    });
  });

  actions.appendChild(cancelButton);
  actions.appendChild(confirmButton);

  modal.appendChild(modalTitle);
  modal.appendChild(modalMessage);
  modal.appendChild(actions);

  confirmDialog.appendChild(modal);
  document.body.appendChild(confirmDialog);

  return confirmDialog;
};
