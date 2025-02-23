import './index.css';
import {
  checkRequiredFields,
  clearFieldError,
  setError,
  sendFormData,
} from './formHandler.js';
import { ErrorDialog } from '../../components/ErrorDialog/index.js';
import { openModal, closeModal } from '../../lib/modal.js';

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
const requiredFields = document.querySelectorAll('[required]');

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

requiredFields.forEach((field) => {
  field.addEventListener('input', () => clearFieldError(field));
});

// Abrir a última seção
const openFinalSection = () => {
  section3.style.display = 'none';
  section4.style.display = 'flex';
  section4.classList.add('active');
  document.querySelector('.section-type').style.display = 'none';
  document.querySelector('.enrollment').style.border = 'none';

  enrollment.style.justifyContent = 'center';
  titleSection.innerText = 'Sua inscrição foi enviada';
  titleSection.style.marginBottom = '0';
  nextButton.style.display = 'none';
};

// TODO Colocar lógica do reenvio do email & recebimento de confirmação
// Abrir emailDialog e, após 3s, abrir a última seção (apenas pra visualização de todo o fluxo)
const handleEmailDialog = () => {
  closeModal(submitDialog);
  openModal(emailDialog);

  setTimeout(() => {
    closeModal(emailDialog);
    openFinalSection();
  }, 3000);
};

const focusOnFirstError = (errors) => {
  if (!Array.isArray(errors)) {
    return;
  }

  const firstErrorName = errors[0].field;
  const inputError = document.querySelector(`[name="${firstErrorName}"]`);
  const labelError = inputError.closest('label');
  const errorSection = inputError.closest('.section-inputs');

  const step = sections.findIndex((section) => section.section == errorSection);

  setError([labelError]);

  updateStep(step);
};

const handleErrorDialog = (errors) => {
  closeModal(submitDialog);

  const errorDialog = ErrorDialog(errors, () => focusOnFirstError(errors));

  openModal(errorDialog);
};

// Função de submeter cadastro

const handleSubmitForm = async () => {
  const { isValid, invalidFields } = checkRequiredFields(formList[currentStep]);

  if (!isValid) {
    setError(invalidFields);
    closeModal(submitDialog);
    return;
  }

  const formData = new FormData();

  formList.forEach((form) => {
    const formFields = new FormData(form);
    for (const [key, value] of formFields.entries()) {
      formData.append(key, value);
    }
  });

  const result = await sendFormData(formData);

  if (result.success) {
    handleEmailDialog();
  } else {
    handleErrorDialog(result.errors);
  }
};

closeModalButton.addEventListener('click', () => closeModal(submitDialog));
confirmSubmitButton.addEventListener('click', handleSubmitForm);

const sectionName = document.getElementById('section-name');

const updateStep = (step) => {
  if (step > currentStep) {
    const { isValid, invalidFields } = checkRequiredFields(
      formList[currentStep],
    );

    if (!isValid) {
      setError(invalidFields);
      return;
    }
  }

  currentStep = step;
  nextButton.innerText = currentStep === 2 ? 'Enviar Formulário' : 'Continue';

  sections.forEach((item, index) => {
    item.icon.classList.toggle('active', index === step);
    item.section.style.display = index === step ? 'block' : 'none';

    item.section.querySelectorAll('label').forEach((label) => {
      label.classList.add('show-animation');

      setTimeout(() => {
        label.classList.remove('show-animation');
      }, 1000);
    });
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
