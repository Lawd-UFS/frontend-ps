import Interview from '../../../components/Interview';
import { fetchQuestions, fetchInterviewCandidate } from '../interviewHandler';
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

  div.appendChild(Interview.Questions(questions, candidate.name));

  div.appendChild(
    Interview.Stages(['Seção 01', 'Seção 02', 'Seção 03', 'Seção 04']),
  );

  return div;
};
