import Interview from '../../../components/Interview';
import { Button } from '../../../components/Button';
import { CandidateInfo } from '../../../components/CandidateInfo';
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
    alert('Erro ao carregar roteiro da entrevista');
  } else {
    questions = await fetchQuestions();
  }

  const interviewQuestions = Interview.Questions(questions, candidate.name);

  div.appendChild(interviewQuestions);

  div.appendChild(CandidateInfo(candidate));

  if (scriptIsLoaded && status === 'new') {
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
        window.location.href = '/minha-agenda';
      } else {
        const errorMessage = result.errors
          .map((error) => {
            const question = error.field.split('.')[1];
            const errorMessage = `Questão ${question + 1}: ${error.message}`;
            return errorMessage;
          })
          .join('\n');
        alert(`Erro ao salvar entrevista: ${result.message}\n${errorMessage}`);
      }
    });

    interviewQuestions.appendChild(saveInterviewButton);
  }

  return div;
};
