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

  createCalendar(
    { periodStart: new Date('2026-03-06'), periodEnd: new Date('2026-03-12') },
    calendarContainer,
  );

  document.querySelectorAll('label > div > svg').forEach((svg) => {
    const input = svg.nextElementSibling;
    svg.addEventListener('click', () => input.showPicker());
  });

  await createSchedule(agendaContainer);
  await createOverview(overviewContainer);

  applyCalendarEvents(calendarContainer, agendaContainer);
});
