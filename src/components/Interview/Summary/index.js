/* eslint-disable indent */
import './styles.css';

import circleSVG from '../../../assets/images/circle.svg';
import profileImage from '../../../assets/images/icon-user.png';

export const InterviewSummary = (
  { candidateName, candidatePhoto },
  questionsScores,
  ranking,
) => {
  const MAX_DOTS = 10;

  const areas = Object.keys(questionsScores);

  const div = document.createElement('div');
  div.setAttribute('id', 'summary');

  div.innerHTML = `
    <header>
      <h3>Resumo de ${candidateName}</h3>
      <img src="${candidatePhoto ?? profileImage}" alt="Foto de perfil" />
    </header>
    <ul id="question-scores">
      ${Array.from(areas)
        .map((area) => {
          const value = questionsScores[area];

          const allDots = Array.from({ length: MAX_DOTS }).map(() => circleSVG);

          allDots.forEach((dot, index, array) => {
            if (index <= value - 1) {
              array[index] = dot.replace('svg', 'svg class="marked"');
            }
          });

          return `
          <li>
            <h4>${area.capitalize()}</h4>
            <div class="total-score">
              <span class="dots">${allDots.reverse().join('')}</span>
              <span>${value}</span> 
            </div>
          </li>
        `;
        })
        .join('')}
    </ul>
    <hr/>
    <footer>
      <h3>Posição no ranking</h3>
      <span>${ranking ? `${ranking}º` : 'Sem ranking'}</span>
    </footer>
  `;

  return div;
};
