import './styles.css';

export const InterviewInstructions = (instructions = []) => {
  const div = document.createElement('div');
  div.setAttribute('class', 'interview-instructions');

  const header = document.createElement('header');

  header.innerHTML = `
  <h2>Notas</h2>
  <p>Entenda como fazer a avaliação</p>
  `;

  const descriptionList = document.createElement('dl');

  instructions.forEach((instruction) => {
    const descriptionTitle = document.createElement('dt');
    descriptionTitle.textContent = instruction.title;

    const descriptionText = document.createElement('dd');
    descriptionText.textContent = instruction.text;

    descriptionList.appendChild(descriptionTitle);
    descriptionList.appendChild(descriptionText);
  });

  div.appendChild(header);
  div.appendChild(descriptionList);

  return div;
};
