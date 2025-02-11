/* eslint-disable indent */
import './styles.css';

import circleSVG from '../../../assets/images/circle.svg';
import profileImage from '../../../assets/images/icon-user.png';

export const InterviewSummary = (candidateName, questionsScores) => {
  const MAX_DOTS = 10;

  const areas = Object.keys(questionsScores);

  const div = document.createElement('div');
  div.setAttribute('id', 'summary');

  div.innerHTML = `
    <header>
      <h3>Resumo de ${candidateName}</h3>
      <img src="${profileImage}" alt="Foto de perfil" />
    </header>
    <ul id="question-scores">
      ${Array.from(areas)
        .map((area) => {
          const { value: totalScore, maxPossibleValue: maxScore } =
            questionsScores[area];

          const numberOfDots = Math.floor((totalScore / maxScore) * MAX_DOTS);

          const dots = Array.from({ length: numberOfDots }).map(
            () => circleSVG,
          );

          return `
          <li>
            <h4>${area}</h4>
            <div class="total-score">
              <span class="dots">${dots.join('')}</span>
              <span>${totalScore}</span> 
            </div>
          </li>
        `;
        })
        .join('')}
    </ul>
    <hr/>
    <footer>
      <h3>Posição no ranking</h3>
      <span>54º</span>
    </footer>
  `;

  return div;
};
