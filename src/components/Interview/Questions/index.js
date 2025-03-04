import editSVG from '../../../assets/images/edit.svg';
import { Badge } from '../../Badge';
import './styles.css';

const Notes = (text) => {
  const div = document.createElement('div');
  div.className = 'notes';

  const textarea = document.createElement('textarea');

  const editElement = document.createElement('div');
  editElement.className = 'edit';
  editElement.innerHTML = `
    ${editSVG}
    <span>Escreva seu registro aqui</span>
  `;

  textarea.addEventListener('focusin', () => {
    if (div.contains(editElement)) {
      div.removeChild(editElement);
    }
  });

  textarea.addEventListener('focusout', () => {
    if (!textarea.value) {
      div.prepend(editElement);
    }
  });

  editElement.addEventListener('click', () => {
    textarea.focus();
  });

  div.appendChild(textarea);
  div.appendChild(editElement);

  if (text) {
    textarea.textContent = text;
    editElement.remove();
  }

  return div;
};

const Question = ({
  text,
  area,
  score: candidateScore,
  notes,
  candidateName,
}) => {
  const scores = ['Insuficiente', 'Razoável', 'Bom', 'Excelente'];

  const article = document.createElement('article');
  article.className = 'question';

  article.innerHTML = `
  <header>
    <h2><span class="candidate-name">${candidateName}</span>, ${text}</h2>
  </header>
  <ul class="scores">
  </ul>
  `;

  scores.forEach((score) => {
    const li = document.createElement('li');
    li.textContent = score;

    li.addEventListener('click', () => {
      const activeScore = article.querySelector('[active]');

      li.toggleAttribute('active');

      if (activeScore) {
        activeScore.removeAttribute('active');
      }
    });

    if (candidateScore == score) {
      li.setAttribute('active', '');
    }

    article.querySelector('.scores').appendChild(li);
  });

  article.querySelector('header').prepend(Badge(area));
  article.appendChild(Notes(notes));

  return article;
};

export const InterviewQuestions = (questions = [], candidateName) => {
  const section = document.createElement('section');
  section.setAttribute('id', 'questions');

  questions.forEach((question) =>
    section.appendChild(Question({ ...question, candidateName })),
  );

  return section;
};
