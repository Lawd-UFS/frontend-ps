import calendarIcon from '/src/assets/images/calendar-icon.svg';
import './styles.css';

export const InterviewTime = (
  dateTime,
  container = document.createElement('div'),
) => {
  const dayOfWeek = dateTime
    .toLocaleString('pt-BR', { weekday: 'long' })
    .split('-')[0]
    .capitalize();

  const dateNumber = dateTime.getDate();

  const month = dateTime
    .toLocaleString('pt-BR', { month: 'long' })
    .capitalize();

  const time = `${dateTime.getHours()}h${dateTime.getMinutes().toString().padStart(2, '0')}`;

  container.className = 'time';

  const timeElement = document.createElement('time');
  timeElement.setAttribute('dateTime', dateTime);

  timeElement.innerHTML = `
    <span>${dateNumber} de ${month}</span>
    <span>${dayOfWeek} - ${time}</span>
  `;

  container.innerHTML += `${calendarIcon}`;
  container.appendChild(timeElement);

  return container;
};
