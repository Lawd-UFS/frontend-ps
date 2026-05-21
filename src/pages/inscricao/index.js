import './index.css';
import {
  checkRequiredFields,
  clearFieldError,
  setError,
  sendFormData,
} from './formHandler.js';
import { ErrorDialog } from '../../components/ErrorDialog';
import { openModal, closeModal } from '../../lib/modal.js';

let currentStep = 0;
let maxStepReached = 0;
let nextButton,
  submitDialog,
  emailDialog,
  closeModalButton,
  closeEmailDialogButton,
  reSendEmailButton;
let confirmSubmitButton, formList;
let section1, section2, section3, requiredFields, sections, sectionName;

const initializeElements = () => {
  nextButton = document.querySelector('.registerButton');
  submitDialog = document.getElementById('submitDialog');
  emailDialog = document.getElementById('emailDialog');
  closeModalButton = document.getElementById('closeModal');
  closeEmailDialogButton = document.getElementById('closeEmailDialog');
  reSendEmailButton = document.getElementById('reSendEmailButton');
  confirmSubmitButton = document.getElementById('confirmSubmit');
  formList = document.querySelectorAll('form');
  section1 = document.getElementById('section1');
  section2 = document.getElementById('section2');
  section3 = document.getElementById('section3');
  requiredFields = document.querySelectorAll('[required]');
  sectionName = document.getElementById('section-name');

  sections = [
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

  const checkboxes = document.querySelectorAll('input[name="source"]');
  checkboxes.forEach((cb) => {
    cb.addEventListener('change', () => {
      const sourceLabel = document.querySelector('label[for="source"]');
      if (sourceLabel) {
        sourceLabel.classList.remove('error');
      }
    });
  });

  const dateBirthInput = document.getElementById('date-birth');
  if (dateBirthInput) {
    const today = new Date().toISOString().split('T')[0];
    dateBirthInput.setAttribute('max', today);
  }

  closeEmailDialogButton.addEventListener('click', () =>
    closeModal(emailDialog),
  );
  closeModalButton.addEventListener('click', () => closeModal(submitDialog));
  confirmSubmitButton.addEventListener('click', handleSubmitForm);

  // Lógica do reenvio do email
  reSendEmailButton.addEventListener('click', async () => {
    const emailInput = document.getElementById('email').value;
    if (!emailInput) {
      return;
    }

    try {
      reSendEmailButton.disabled = true;
      reSendEmailButton.innerText = 'Enviando...';

      const response = await fetch(
        `${process.env.API_URL}/enviar-confirmacao-email?email=${encodeURIComponent(emailInput)}`,
        {
          method: 'POST',
        },
      );

      if (response.ok) {
        alert('Email reenviado com sucesso!');
      } else {
        alert('Erro ao reenviar email.');
      }
    } catch (error) {
      alert('Erro de conexão ao reenviar email.');
    } finally {
      reSendEmailButton.disabled = false;
      reSendEmailButton.innerText = 'Reenviar email';
    }
  });

  sections.forEach((item, index) => {
    item.icon.addEventListener('click', () => {
      if (index <= maxStepReached) {
        updateStep(index);
      }
    });
  });

  nextButton.addEventListener('click', nextStep);

  // Estilização de inputs
  document.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener('change', function () {
      const fileName =
        this.files.length > 0
          ? this.files[0].name
          : 'Nenhum arquivo selecionado';
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
};

// Lógica do recebimento de confirmação
const handleEmailDialog = () => {
  closeModal(submitDialog);
  openModal(emailDialog);
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

  const payload = {};

  formList.forEach((form) => {
    const formFields = new FormData(form);
    for (const [key, value] of formFields.entries()) {
      if (payload[key]) {
        if (!Array.isArray(payload[key])) {
          payload[key] = [payload[key]];
        }
        payload[key].push(value);
      } else {
        payload[key] = value;
      }
    }
  });

  const result = await sendFormData(payload);

  if (result.success) {
    handleEmailDialog();
  } else {
    handleErrorDialog(result.errors);
  }
};

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
  maxStepReached = Math.max(maxStepReached, step);
  nextButton.innerText = currentStep === 2 ? 'Enviar Formulário' : 'Continue';

  sections.forEach((item, index) => {
    item.icon.classList.toggle('active', index === step);
    item.icon.classList.toggle(
      'clickable',
      index !== step && index <= maxStepReached,
    );
    item.icon.classList.toggle('locked', index > maxStepReached);
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

const init = () => {
  initializeElements();
  updateStep(0);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
