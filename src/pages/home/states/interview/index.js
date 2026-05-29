import './index.css';

var textWrapper = document.querySelector('.title');
if (textWrapper) {
  textWrapper.innerHTML = textWrapper.textContent.replace(
    /\S/g,
    "<span class='letter'>$&</span>",
  );

  anime.timeline({ autoplay: true }).add({
    targets: '.title .letter',
    translateY: [100, 0],
    translateZ: 0,
    opacity: [0, 1],
    easing: 'easeOutExpo',
    duration: 1400,
    delay: (el, i) => 300 + 30 * i,
  });
}

document.querySelectorAll('.support-text').forEach((textWrapper, index) => {
  textWrapper.innerHTML = textWrapper.textContent.replace(
    /\S/g,
    "<span class='tagline'>$&</span>",
  );

  // Adiciona um atraso antes de iniciar a animação
  setTimeout(() => {
    anime
      .timeline({ loop: true })
      .add({
        targets: textWrapper.querySelectorAll('.tagline'),
        translateX: [40, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 1200,
        delay: (el, i) => 500 + 30 * i, // Delay por letra
      })
      .add({
        targets: textWrapper.querySelectorAll('.tagline'),
        translateX: [0, -30],
        opacity: [1, 0],
        easing: 'easeInExpo',
        duration: 1100,
        delay: (el, i) => 100 + 30 * i,
      });
  }, index * 1031); // Atraso diferente para cada bloco de texto
});

// Fluxo de Solicitação de Link de Agendamento
document.addEventListener('DOMContentLoaded', () => {
  const storedCode = localStorage.getItem('ps_lawd_access_code');
  if (storedCode) {
    window.location.href = '/agendar-entrevista';
    return;
  }

  const btnAgendarInicial = document.getElementById('btn-agendar-inicial');
  const emailFormContainer = document.getElementById('email-form-container');
  const schedulingEmailForm = document.getElementById('scheduling-email-form');
  const candidateEmailInput = document.getElementById('candidate-email');
  const formSpinner = document.getElementById('form-spinner');
  const formFeedback = document.getElementById('form-feedback');

  if (btnAgendarInicial && emailFormContainer) {
    btnAgendarInicial.addEventListener('click', () => {
      btnAgendarInicial.classList.add('hidden');
      emailFormContainer.classList.remove('hidden');
      if (candidateEmailInput) {
        candidateEmailInput.focus();
      }
    });
  }

  if (schedulingEmailForm) {
    schedulingEmailForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = candidateEmailInput.value.trim();
      if (!email) return;

      // Estado de carregamento
      const submitButton = schedulingEmailForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      if (formSpinner) formSpinner.classList.remove('hidden');
      if (formFeedback) {
        formFeedback.classList.add('hidden');
        formFeedback.className = 'form-feedback';
      }

      try {
        const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/agendamento/solicitar-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          if (formFeedback) {
            formFeedback.textContent = data.message || 'Link de agendamento enviado com sucesso! Verifique sua caixa de entrada.';
            formFeedback.classList.remove('hidden');
            formFeedback.classList.add('success');
          }
          candidateEmailInput.value = '';
        } else {
          if (formFeedback) {
            formFeedback.textContent = data.message || 'E-mail não encontrado ou cadastro inativo.';
            formFeedback.classList.remove('hidden');
            formFeedback.classList.add('error');
          }
        }
      } catch (error) {
        console.error('Erro na solicitação de agendamento:', error);
        if (formFeedback) {
          formFeedback.textContent = 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.';
          formFeedback.classList.remove('hidden');
          formFeedback.classList.add('error');
        }
      } finally {
        if (submitButton) submitButton.disabled = false;
        if (formSpinner) formSpinner.classList.add('hidden');
      }
    });
  }
});
