// Função para abrir um modal
export const openModal = (modal) => {
  modal.classList.remove('closing');
  modal.classList.add('opening');
  modal.showModal();
};

// Função para fechar um modal
export const closeModal = (modal) => {
  modal.classList.add('closing');
  modal.addEventListener(
    'animationend',
    (event) => {
      if (event.animationName === 'closing') {
        modal.close();
      }
    },
    { once: true },
  );
};
