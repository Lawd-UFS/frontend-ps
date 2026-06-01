import { authenticationService } from '../../service/AuthenticationService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import './index.css';
import { Header } from '../../components/Header';
import { createCalendar, createSchedule, createOverview } from './calendar';
import calendarIcon from '../../assets/images/calendar-icon.svg';
import timeIcon from '../../assets/images/time.svg';
import { applyCalendarEvents, applyCalendarDayEvents } from './scheduleHandler';

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

  const parseDateEnv = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  const periodStart = parseDateEnv(process.env.INTERVIEW_START_DATE);
  const periodEnd = parseDateEnv(process.env.INTERVIEW_END_DATE);

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startDateStr = formatDate(periodStart);
  const endDateStr = formatDate(periodEnd);

  createCalendar(
    {
      periodStart: periodStart,
      periodEnd: periodEnd,
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

  calendarContainer.addEventListener('calendar-rendered', () => {
    applyCalendarDayEvents(calendarContainer);
  });
});
