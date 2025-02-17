import './styles.css';

import circleSVG from '../../../assets/images/circle.svg';

export const InterviewStages = (stages = []) => {
  const div = document.createElement('div');
  div.setAttribute('id', 'stages');

  div.innerHTML = `
      <h2>Etapas</h2>
      `;

  const nav = document.createElement('nav');

  stages.forEach((stage) => {
    const a = document.createElement('a');
    a.className = 'stage';

    a.innerHTML = `
    ${circleSVG}
    <p>${stage}</p>
    `;

    nav.appendChild(a);
  });

  div.appendChild(nav);

  div.querySelector('.stage').setAttribute('active', '');

  return div;
};
