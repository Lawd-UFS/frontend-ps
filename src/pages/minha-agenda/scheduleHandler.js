import { HttpClient } from '../../infra/http/httpClient';
import { ScheduleService } from '../../service/ScheduleService';
import { addNewScheduleTime, getScheduleStatus } from './calendar';
import { Profile } from '../../components/Profile';
import { Button } from '../../components/Button';
import { authenticationService } from '../../service/AuthenticationService';
import { stateService } from '../../service/StateService';

const scheduleService = new ScheduleService(
  HttpClient.create(),
  authenticationService.getToken(),
);

export const fetchAllSchedules = async () => {
  const response = await scheduleService.getAllSchedules();

  if (!response.success) {
    alert('Ocorreu um erro ao buscar os horários');
    return [];
  }

  return response.data;
};

export const fetchEvaluatorSchedules = async () => {
  const response = await scheduleService.getEvaluatorSchedules();

  if (!response.success) {
    alert('Ocorreu um erro ao buscar os horários da agenda');
    return [];
  }

  return response.data;
};

export const fetchOverview = async () => {
  const response = await scheduleService.getOverview();

  if (!response.success) {
    alert('Ocorreu um erro ao buscar a visão geral da agenda');
    return {
      total: {
        times: 0,
        scheduledTimes: 0,
        availableTimes: 0,
      },
      evaluator: {
        times: 0,
        scheduledTimes: 0,
        availableTimes: 0,
      },
    };
  }

  return response.data;
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

  setTimeout(async () => {
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

    if (candidate && !candidate.isEmpty()) {
      const profile = await Profile({
        name: candidate.name,
        imgSrc: candidate.profilePhotoUrl,
      });
      detailsContainer.appendChild(profile);
    }

    if (['past', 'scheduled'].includes(schedule.status)) {
      const goToInterviewButton = Button('Ir para entrevista');
      goToInterviewButton.addEventListener('click', () => {
        if (schedule.status === 'past') {
          stateService.saveState('interview', {
            status: 'old',
            candidate: schedule.candidate,
            date: schedule.dateTime,
          });

          window.history.pushState(
            {},
            '',
            `/entrevista/${schedule.candidate.id}`,
          );
          window.location.reload();
          return;
        }

        stateService.saveState('interview', {
          status: 'new',
          candidate: schedule.candidate,
          evaluator: schedule.evaluator ?? authenticationService.getUserData(),
          date: schedule.dateTime,
        });

        window.location.href = '/entrevista';
      });

      detailsContainer.appendChild(goToInterviewButton);
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

  const response = await scheduleService.createSchedule({
    dateTime,
    interviewMode,
  });

  if (!response.success) {
    let errorMsg = response.message || 'Ocorreu um erro ao criar o horário';
    if (response.errors && response.errors.length > 0) {
      errorMsg = response.errors.map(err => err.message).join(' | ');
    }

    if (errorMessage) {
      errorMessage.textContent = errorMsg;
      errorMessage.style.display = 'block';
    } else {
      alert(errorMsg);
    }
    return;
  }

  addNewScheduleTime(
    response.data,
    agendaContainer,
    updateScheduleDetailsOnScheduleClick,
  );
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
