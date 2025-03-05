import Interview from '../../../components/Interview';
import { Button } from '../../../components/Button';
import {
  fetchQuestions,
  fetchInterviewCandidate,
  getInterviewAnswers,
  fetchInterviewStatus,
  saveInterview,
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

  const questions = await fetchQuestions();
  const candidate = await fetchInterviewCandidate();
  const status = await fetchInterviewStatus();

  const interviewQuestions = Interview.Questions(questions, candidate.name);

  div.appendChild(interviewQuestions);

  div.appendChild(
    Interview.Stages(['Seção 01', 'Seção 02', 'Seção 03', 'Seção 04']),
  );

  if (status === 'new') {
    const saveInterviewButton = Button('Salvar Entrevista');
    saveInterviewButton.addEventListener('click', async () => {
      let answers;

      try {
        answers = getInterviewAnswers(interviewQuestions, questions);
      } catch (error) {
        alert(error.message);
        return;
      }

      const result = await saveInterview(answers);

      if (result.success) {
        alert('Entrevista salva com sucesso');
        window.location.href = '/agendamento';
      } else {
        alert(`Erro ao salvar entrevista: ${result.message}`);
      }
    });

    interviewQuestions.appendChild(saveInterviewButton);
  }

  return div;
};
