import Interview from '../../../components/Interview';
import { Button } from '../../../components/Button';
import { CandidateInfo } from '../../../components/CandidateInfo';
import { ErrorDialog } from '../../../components/ErrorDialog';
import { openModal } from '../../../lib/modal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import {
  fetchQuestions,
  fetchInterviewCandidate,
  getInterviewAnswers,
  fetchInterviewStatus,
  saveInterview,
  loadInterviewScript,
} from '../interviewHandler';
import './styles.css';

export const ApplyPage = async () => {
  const div = document.createElement('div');
  div.setAttribute('id', 'apply');

  const applyPageLink = document.getElementById('apply-link');
  applyPageLink.setAttribute('active', '');

  div.appendChild(
    Interview.Instructions([
      {
        title: 'Excelente',
        text: 'Esse é lawd na veia',
      },
      {
        title: 'Bom',
        text: 'Alecrim dourado',
      },
      {
        title: 'Razoável',
        text: 'ta ok',
      },
      {
        title: 'Insuficiente',
        text: 'Ruim demais, cê é loko',
      },
    ]),
  );

  const candidate = await fetchInterviewCandidate();
  const status = await fetchInterviewStatus();

  const scriptIsLoaded = await loadInterviewScript();

  let questions = [];

  if (!scriptIsLoaded) {
    const errorDialog = ErrorDialog([
      { message: 'Erro ao carregar roteiro da entrevista' },
    ]);
    openModal(errorDialog);
  } else {
    questions = await fetchQuestions();
  }

  const interviewQuestions = Interview.Questions(questions, candidate.name);

  div.appendChild(interviewQuestions);

  div.appendChild(CandidateInfo(candidate));

  if (scriptIsLoaded && status === 'new') {
    const actionContainer = document.createElement('div');
    actionContainer.style.display = 'flex';
    actionContainer.style.gap = '1rem';
    actionContainer.style.marginTop = '2rem';

    const saveAndApproveButton = Button('Salvar e Aprovar');
    saveAndApproveButton.style.backgroundColor = 'var(--green-500, #10b981)';
    saveAndApproveButton.style.flex = '1';

    const saveAndRejectButton = Button('Salvar e Reprovar');
    saveAndRejectButton.style.backgroundColor = 'var(--red, #ef4444)';
    saveAndRejectButton.style.flex = '1';

    const handleSave = async (statusLabel, statusValue) => {
      let answers;

      try {
        answers = getInterviewAnswers(interviewQuestions, questions);
      } catch (error) {
        const errorDialog = ErrorDialog([{ message: error.message }]);
        openModal(errorDialog);
        return;
      }

      const dialog = ConfirmDialog({
        title: `Entrevista: ${statusLabel}`,
        message: `Tem certeza que deseja salvar esta entrevista e ${statusLabel.toLowerCase()} o candidato? Essa ação não pode ser desfeita.`,
        onConfirm: async () => {
          const result = await saveInterview(answers, statusValue);

          if (result.success) {
            window.location.href = '/minha-agenda';
          } else {
            const errorList = result.errors
              ? result.errors
                  .map((error) => {
                    if (error.field && error.field.includes('.')) {
                      const question = error.field.split('.')[1];
                      return `Questão ${Number(question) + 1}: ${error.message}`;
                    }
                    return `${error.message}`;
                  })
                  .join('\n')
              : '';
            const errorMsg = `Erro ao salvar entrevista: ${result.message}${errorList ? '\n' + errorList : ''}`;
            const errorDialog = ErrorDialog([{ message: errorMsg }]);
            openModal(errorDialog);
          }
        },
      });
      openModal(dialog);
    };

    saveAndApproveButton.addEventListener('click', () => handleSave('Aprovar', 'aprovado_entrevista'));
    saveAndRejectButton.addEventListener('click', () => handleSave('Reprovar', 'reprovado_entrevista'));

    actionContainer.appendChild(saveAndApproveButton);
    actionContainer.appendChild(saveAndRejectButton);

    interviewQuestions.appendChild(actionContainer);
  }

  return div;
};
