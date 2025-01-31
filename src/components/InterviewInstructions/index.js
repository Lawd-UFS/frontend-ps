import './styles.css';

export const InterviewInstructions = () => {
  const instructions = [
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
  ];

  const section = document.createElement('section');
  section.setAttribute('class', 'interview-instructions');

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

  section.appendChild(header);
  section.appendChild(descriptionList);

  return section;
};
