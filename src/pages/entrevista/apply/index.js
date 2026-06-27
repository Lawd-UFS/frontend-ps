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
  editInterview,
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

  interviewQuestions.addEventListener('input', () => {
    window.isDirty = true;
  });

  interviewQuestions.addEventListener('click', (e) => {
    if (e.target.closest('.scores') && e.target.tagName !== 'DIV') {
      window.isDirty = true;
    }
  });

  div.appendChild(interviewQuestions);

  div.appendChild(CandidateInfo(candidate));

  if (scriptIsLoaded && (status === 'new' || status === 'edit')) {
    const style = document.createElement('style');
    style.innerHTML = `
      .modern-action-container {
        display: flex;
        gap: 1.5rem;
        margin-top: 3rem;
        margin-bottom: 8rem;
        width: 100%;
        justify-content: center;
      }
      .modern-save-btn {
        padding: 1.2rem 3.2rem;
        min-width: 24rem;
        border: none;
        border-radius: 12px;
        font-family: inherit;
        font-size: 1.5rem;
        font-weight: 600;
        cursor: pointer;
        color: white;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        justify-content: center;
        align-items: center;
        letter-spacing: 0.025em;
      }
      .modern-save-btn.edit {
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        box-shadow: 0 4px 15px -3px rgba(99, 102, 241, 0.4);
      }
      .modern-save-btn.edit:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.6);
      }
      .modern-save-btn.approve {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        box-shadow: 0 4px 15px -3px rgba(16, 185, 129, 0.4);
      }
      .modern-save-btn.approve:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.6);
      }
      .modern-save-btn.reject {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        box-shadow: 0 4px 15px -3px rgba(239, 68, 68, 0.4);
      }
      .modern-save-btn.reject:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -4px rgba(239, 68, 68, 0.6);
      }
      .modern-save-btn.cancel {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        box-shadow: 0 4px 15px -3px rgba(107, 114, 128, 0.4);
      }
      .modern-save-btn.cancel:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -4px rgba(107, 114, 128, 0.6);
      }
      .modern-save-btn:active {
        transform: translateY(1px);
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.3);
      }
    `;
    document.head.appendChild(style);

    const actionContainer = document.createElement('div');
    actionContainer.className = 'modern-action-container';

    const handleSave = async (statusLabel, statusValue, isEdit = false) => {
      let answers;

      try {
        answers = getInterviewAnswers(interviewQuestions, questions);
      } catch (error) {
        const errorDialog = ErrorDialog([{ message: error.message }]);
        openModal(errorDialog);
        return;
      }

      const dialog = ConfirmDialog({
        title: isEdit ? `Salvar Alterações` : `Entrevista: ${statusLabel}`,
        message: isEdit 
          ? `Tem certeza que deseja salvar as alterações desta avaliação?` 
          : `Tem certeza que deseja salvar esta entrevista e ${statusLabel.toLowerCase()} o candidato? Essa ação não pode ser desfeita.`,
        onConfirm: async () => {
          let result;
          if (isEdit) {
             result = await editInterview(answers, statusValue);
          } else {
             result = await saveInterview(answers, statusValue);
          }

          if (result.success) {
            window.isSaving = true;
            window.location.href = '/agendamento-geral';
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

    if (status === 'edit') {
      const cancelButton = document.createElement('button');
      cancelButton.className = 'modern-save-btn cancel';
      cancelButton.textContent = 'Cancelar';

      cancelButton.addEventListener('click', () => {
        if (window.isDirty) {
          if (confirm('Você tem alterações não salvas. Deseja realmente cancelar a edição?')) {
            window.isSaving = true;
            window.location.href = '/agendamento-geral';
          }
        } else {
          window.isSaving = true;
          window.location.href = '/agendamento-geral';
        }
      });

      const saveButton = document.createElement('button');
      saveButton.className = 'modern-save-btn edit';
      saveButton.textContent = 'Salvar Alterações';

      saveButton.addEventListener('click', () => handleSave('Alterar', undefined, true));
      
      actionContainer.appendChild(cancelButton);
      actionContainer.appendChild(saveButton);
    } else {
      const saveAndApproveButton = document.createElement('button');
      saveAndApproveButton.className = 'modern-save-btn approve';
      saveAndApproveButton.textContent = 'Salvar e Aprovar';

      const saveAndRejectButton = document.createElement('button');
      saveAndRejectButton.className = 'modern-save-btn reject';
      saveAndRejectButton.textContent = 'Salvar e Reprovar';

      saveAndApproveButton.addEventListener('click', () => handleSave('Aprovar', 'aprovado_entrevista', false));
      saveAndRejectButton.addEventListener('click', () => handleSave('Reprovar', 'reprovado_entrevista', false));

      actionContainer.appendChild(saveAndApproveButton);
      actionContainer.appendChild(saveAndRejectButton);
    }

    interviewQuestions.appendChild(actionContainer);
  }

  return div;
};
