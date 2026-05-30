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
    dateBirthInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 8) value = value.slice(0, 8);
      
      let formatted = value;
      if (value.length > 2) {
        formatted = `${value.slice(0, 2)}/`;
        if (value.length > 4) {
          formatted += `${value.slice(2, 4)}/${value.slice(4)}`;
        } else {
          formatted += value.slice(2);
        }
      }
      e.target.value = formatted;
    });
  }

  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '')
      if (value.length > 11) value = value.slice(0, 11);
      
      let formatted = value;
      if (value.length > 2) {
        formatted = `(${value.slice(0, 2)}) `;
        if (value.length > 7) {
          formatted += `${value.slice(2, 7)}-${value.slice(7)}`;
        } else {
          formatted += value.slice(2);
        }
      }
      e.target.value = formatted;
    });
  }

  closeEmailDialogButton.addEventListener('click', () =>
    closeModal(emailDialog),
  );
  closeModalButton.addEventListener('click', () => closeModal(submitDialog));
  confirmSubmitButton.addEventListener('click', handleSubmitForm);

  // Toast de feedback (dentro do dialog para aparecer acima do backdrop)
  const showToast = (message, isError = false) => {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '12px 24px';
    toast.style.backgroundColor = isError ? '#df2c1f' : '#4CAF50';
    toast.style.color = 'white';
    toast.style.borderRadius = '1.2rem';
    toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    toast.style.zIndex = '10000';
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.fontFamily = "'Space Grotesk', sans-serif";
    toast.style.fontSize = '1.5rem';
    toast.style.fontWeight = '500';

    // Inserir dentro do dialog aberto para ficar no top-layer
    const openDialog = emailDialog.open ? emailDialog : document.body;
    openDialog.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

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
        showToast('Email reenviado com sucesso!');
      } else {
        showToast('Erro ao reenviar email.', true);
      }
    } catch (error) {
      showToast('Erro de conexão ao reenviar email.', true);
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
      let finalValue = value;
      if (key === 'phone') {
        finalValue = value.replace(/\D/g, '');
      } else if (key === 'birthDate' && value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 3) {
          finalValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      
      if (payload[key]) {
        if (!Array.isArray(payload[key])) {
          payload[key] = [payload[key]];
        }
        payload[key].push(finalValue);
      } else {
        payload[key] = finalValue;
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
