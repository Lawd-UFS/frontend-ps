import { authenticationService } from '../../service/AuthenticationService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import './index.css';
import { Header } from '../../components/Header';
import { createCalendar, createSchedule, createOverview } from './calendar';
import calendarIcon from '../../assets/images/calendar-icon.svg';
import timeIcon from '../../assets/images/time.svg';
import { applyCalendarEvents } from './scheduleHandler';

document.addEventListener('DOMContentLoaded', async () => {
  const agendaContainer = document.querySelector('.agenda');
  const calendarContainer = document.querySelector('.calendar');
  const overviewContainer = document.querySelector('.overview');

  document
    .querySelector('.input-date')
    .insertAdjacentHTML('afterbegin', calendarIcon);

  document
    .querySelector('.input-time')
    .insertAdjacentHTML('afterbegin', timeIcon);

  document.body.prepend(await Header());

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();

  const startDateStr = `${currentYear}-${currentMonth}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const endDateStr = `${currentYear}-${currentMonth}-${String(lastDay).padStart(2, '0')}`;

  createCalendar(
    {
      periodStart: new Date(currentYear, currentDate.getMonth(), currentDate.getDate()),
      periodEnd: new Date(currentYear, currentDate.getMonth(), lastDay),
    },
    calendarContainer,
  );

  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput) {
    dateInput.min = startDateStr;
    dateInput.max = endDateStr;
  }

  document.querySelectorAll('label > div > svg').forEach((svg) => {
    const input = svg.nextElementSibling;
    svg.addEventListener('click', () => input.showPicker());
  });

  await createSchedule(agendaContainer);
  await createOverview(overviewContainer);

  applyCalendarEvents(calendarContainer, agendaContainer);
});
