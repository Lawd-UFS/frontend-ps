import { HttpClient } from '../../infra/http/httpClient';
import { ScheduleService } from '../../service/ScheduleService';
import { addNewScheduleTime, getScheduleStatus } from './calendar';
import { Profile } from '../../components/Profile';

const token = localStorage.getItem('token');

const scheduleService = new ScheduleService(HttpClient.create(), token);

export const fetchSchedules = async () => {
  try {
    const response = await scheduleService.getEvaluatorSchedules();

    return response.data;
  } catch (error) {
    alert('Ocorreu um erro ao buscar os horários da entrevista');
    return [];
  }
};

const updateDateOnCalendarClick = (dateInput, day) => {
  const date = new Date(day.getAttribute('data-date'));

  dateInput.value = date.toISOString().split('T')[0];
};

const updateCalendarOnDateInputChange = (calendar, date) => {
  const day = calendar.querySelector(`[data-date="${date}"]`);

  const selectedDay = calendar.querySelector('#selected-day');

  if (selectedDay) {
    selectedDay.removeAttribute('id');
  }

  if (day) {
    day.id = 'selected-day';
  }
};

export const updateScheduleDetailsOnScheduleClick = (
  schedule,
  detailsContainer,
) => {
  detailsContainer.style.opacity = 0;
  detailsContainer.parentElement.setAttribute(
    'status',
    getScheduleStatus(schedule),
  );

  setTimeout(() => {
    detailsContainer.innerHTML = '';

    const div = document.createElement('div');
    const statusSpan = document.createElement('span');
    statusSpan.className = 'status';

    const interviewModeSpan = document.createElement('span');
    interviewModeSpan.className = 'interview-mode';

    switch (schedule.status) {
      case 'past':
        statusSpan.textContent = 'Entrevista Realizada';
        break;
      case 'available':
        statusSpan.textContent = 'Horário sem candidato';
        break;
      case 'scheduled':
        statusSpan.textContent = 'Entrevista Agendada';
        break;
      default:
        statusSpan.textContent = 'Status Desconhecido';
        break;
    }

    interviewModeSpan.textContent = ` / ${schedule.interviewMode === 'Ambos' ? 'Presencial ou Remoto' : schedule.interviewMode}`;

    div.appendChild(statusSpan);
    div.appendChild(interviewModeSpan);

    detailsContainer.appendChild(div);

    const { candidate } = schedule;

    if (!candidate.isEmpty()) {
      const profile = new Profile({
        name: candidate.name,
        imgSrc: candidate.profilePhotoUrl,
      });
      detailsContainer.appendChild(profile);
    }

    detailsContainer.style.removeProperty('opacity');
  }, 500);
};

const createNewSchedule = async (form, agendaContainer) => {
  const formData = new FormData(form);

  const date = formData.get('date');
  const time = formData.get('time');
  const interviewMode = formData.get('interview-mode');

  const [year, month, day] = date.split('-');
  const [hours, minutes] = time.split(':');

  const dateTime = new Date(year, month - 1, day, hours, minutes).toISOString();

  try {
    const response = await scheduleService.createSchedule({
      dateTime,
      interviewMode,
    });

    addNewScheduleTime(
      response.data,
      agendaContainer,
      updateScheduleDetailsOnScheduleClick,
    );
  } catch (error) {
    alert('Ocorreu um erro ao criar o horário da entrevista');
  }
};

export const applyCalendarEvents = (calendarContainer, agendaContainer) => {
  const dateInput = calendarContainer.querySelector('input[type="date"]');
  const interviewPeriodList =
    calendarContainer.querySelectorAll('.interview-period');
  const days = calendarContainer.querySelector('.days');

  dateInput.addEventListener('change', (event) => {
    updateCalendarOnDateInputChange(
      days,
      new Date(`${event.target.value}T00:00:00`),
    );
  });

  interviewPeriodList.forEach((element, _, periodList) =>
    element.addEventListener('click', () => {
      periodList.forEach((period) => period.removeAttribute('id'));

      element.id = 'selected-day';

      updateDateOnCalendarClick(dateInput, element);
    }),
  );

  calendarContainer
    .querySelector('form')
    .addEventListener('submit', (event) => {
      event.preventDefault();
      createNewSchedule(event.target, agendaContainer);
    });
};
