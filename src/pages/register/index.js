import './index.css';
import { submitRegister } from './register.js';

let currentStep = 0;
const nextButton = document.querySelector('.registerButton');
const submitDialog = document.getElementById('submitDialog');
const emailDialog = document.getElementById('emailDialog');
const closeModalButton = document.getElementById('closeModal');
const confirmSubmitButton = document.getElementById('confirmSubmit');
const titleSection = document.querySelector('h1');
const enrollment = document.querySelector('.enrollment');
const formList = document.querySelectorAll('form');
const section1 = document.getElementById('section1');
const section2 = document.getElementById('section2');
const section3 = document.getElementById('section3');
const section4 = document.getElementById('section4');

// Função para abrir um modal
const openModal = (modal) => {
  modal.classList.remove('closing');
  modal.classList.add('opening');
  modal.showModal();
};

// Função para fechar um modal
const closeModal = (modal) => {
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

// TODO Colocar lógica do reenvio do email & recebimento de confirmação
// Abrir emailDialog e, após 3s, abrir a última seção (apenas pra visualização de todo o fluxo)
const handleEmailDialog = () => {
  closeModal(submitDialog);
  openModal(emailDialog);
};

// Função de submeter cadastro

const checkRegister = async () => {
  const data = {};

  for (const form of formList) {
    const formData = new FormData(form);
    Object.assign(data, Object.fromEntries(formData));
  }

  const result = await submitRegister(data);

  if (result.sucess) {
    handleEmailDialog();
  } else {
    alert('Houve um problema na submissão. Por gentileza, tente novamente.');
  }
};

closeModalButton.addEventListener('click', () => closeModal(submitDialog));
confirmSubmitButton.addEventListener('click', checkRegister);

const sections = [
  {
    icon: document.getElementById('section1-icon'),
    section: section1,
    name: 'Dados iniciais',
  },
  {
    icon: document.getElementById('section2-icon'),
    section: section2,
    name: 'Sobre você',
  },
  {
    icon: document.getElementById('section3-icon'),
    section: section3,
    name: 'Finalização',
  },
];

const sectionName = document.getElementById('section-name');

const updateStep = (step) => {
  currentStep = step;
  nextButton.innerText = currentStep === 2 ? 'Enviar Formulário' : 'Continue';

  sections.forEach((item, index) => {
    item.icon.classList.toggle('active', index === step);
    item.section.style.display = index === step ? 'block' : 'none';
  });

  sectionName.innerText = sections[step].name;
};

const nextStep = () => {
  if (currentStep < sections.length - 1) {
    updateStep(currentStep + 1);
  } else {
    openModal(submitDialog);
  }
};

sections.forEach((item, index) => {
  item.icon.addEventListener('click', () => updateStep(index));
});

nextButton.addEventListener('click', nextStep);
document.addEventListener('DOMContentLoaded', () => updateStep(0));

// Estilização de inputs
document.querySelectorAll('input[type="file"]').forEach((input) => {
  input.addEventListener('change', function () {
    const fileName =
      this.files.length > 0 ? this.files[0].name : 'Nenhum arquivo selecionado';
    const fileLabel = this.nextElementSibling;
    if (fileLabel && fileLabel.tagName === 'SPAN') {
      fileLabel.textContent = fileName;
      fileLabel.classList.add('filled');
    }
  });
});

document.querySelectorAll('input, select, textarea').forEach((field) => {
  const updateFieldState = () =>
    field.classList.toggle('filled', field.value.trim() !== '');

  field.addEventListener('input', updateFieldState);
  field.addEventListener('change', updateFieldState);

  updateFieldState();
});

// TODO validar os campos required antes de dar continuidade no forms
