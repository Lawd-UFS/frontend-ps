import calendarIcon from '/src/assets/images/calendar-icon.png';
import './styles.css';

export const InterviewTime = (dateTime) => {
  const dayOfWeek = dateTime
    .toLocaleString('pt-BR', { weekday: 'long' })
    .split('-')[0]
    .capitalize();

  const dateNumber = dateTime.getDate();

  const month = dateTime
    .toLocaleString('pt-BR', { month: 'long' })
    .capitalize();

  const time = `${dateTime.getHours()}h${dateTime.getMinutes().toString().padStart(2, '0')}`;

  const div = document.createElement('div');
  div.className = 'time';

  const img = document.createElement('img');
  img.src = calendarIcon;

  const timeElement = document.createElement('time');
  timeElement.setAttribute('dateTime', dateTime);

  timeElement.innerHTML = `
    <span>${dateNumber} de ${month}</span>
    <span>${dayOfWeek} - ${time}</span>
  `;

  div.appendChild(img);
  div.appendChild(timeElement);

  return div;
};
