import { HttpClient } from '../../infra/http/httpClient';
import { ScheduleService } from '../../service/ScheduleService';
import { addNewScheduleTime, getScheduleStatus } from './calendar';
import { Profile } from '../../components/Profile';
import { Button } from '../../components/Button';
import { authenticationService } from '../../service/AuthenticationService';
import { stateService } from '../../service/StateService';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { openModal, closeModal } from '../../lib/modal';

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

  const dayStr = String(date.getDate()).padStart(2, '0');
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const yearStr = date.getFullYear();

  dateInput.value = `${dayStr}/${monthStr}/${yearStr}`;
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

    if (schedule.status === 'available') {
      const actionsDiv = document.createElement('div');
      actionsDiv.style.display = 'flex';
      actionsDiv.style.gap = '1rem';
      actionsDiv.style.marginTop = '1rem';

      const editButton = Button('Editar');
      editButton.style.flex = '1';
      editButton.addEventListener('click', () => {
        openEditModal(schedule);
      });

      const deleteButton = Button('Excluir');
      deleteButton.style.flex = '1';
      deleteButton.style.backgroundColor = 'var(--red-400)';
      deleteButton.addEventListener('click', () => {
        ConfirmDialog({
          title: 'Excluir Horário',
          message: 'Tem certeza que deseja excluir este horário?',
          onConfirm: async () => {
            const res = await scheduleService.deleteSchedule(schedule.id);
            if (res.success !== false) {
              window.location.reload();
            } else {
              alert(res.message || 'Erro ao excluir horário');
            }
          }
        });
      });

      actionsDiv.appendChild(editButton);
      actionsDiv.appendChild(deleteButton);
      detailsContainer.appendChild(actionsDiv);
    }

    detailsContainer.style.removeProperty('opacity');
  }, 500);
};

const openEditModal = (schedule) => {
  const modal = document.createElement('dialog');
  modal.classList.add('confirm-dialog'); // Reusing confirm-dialog style for center modal

  const content = document.createElement('div');
  content.classList.add('modal-content');
  content.style.maxWidth = '400px';

  const title = document.createElement('h2');
  title.textContent = 'Editar Horário';
  content.appendChild(title);

  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '1rem';

  // Date
  const dateObj = new Date(schedule.dateTime);
  const dStr = String(dateObj.getDate()).padStart(2, '0');
  const mStr = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yStr = dateObj.getFullYear();
  const dateValue = `${dStr}/${mStr}/${yStr}`;

  const hStr = String(dateObj.getHours()).padStart(2, '0');
  const minStr = String(dateObj.getMinutes()).padStart(2, '0');
  const timeValue = `${hStr}:${minStr}`;

  form.innerHTML = `
    <label class="form-date" style="display:flex; flex-direction:column; gap:0.5rem; text-align:left;">
      <span>Data: *</span>
      <input type="text" name="date" value="${dateValue}" placeholder="DD/MM/AAAA" maxlength="10" required style="padding:0.5rem; border:1px solid #ccc; border-radius:4px;" />
    </label>
    <label class="form-time" style="display:flex; flex-direction:column; gap:0.5rem; text-align:left;">
      <span>Horário: *</span>
      <select name="time" required style="padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
        <option value="" disabled>Escolha</option>
        ${['07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00']
          .map(t => \`<option value="\${t}" \${t === timeValue ? 'selected' : ''}>\${t}</option>\`).join('')}
      </select>
    </label>
    <div style="display:flex; flex-direction:column; gap:0.5rem; text-align:left;">
      <span>Formato: *</span>
      <select name="interview-mode" required style="padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
        <option value="Presencial" ${schedule.interviewMode === 'Presencial' ? 'selected' : ''}>Presencial</option>
        <option value="Remoto" ${schedule.interviewMode === 'Remoto' ? 'selected' : ''}>Remoto</option>
        <option value="Ambos" ${schedule.interviewMode === 'Ambos' ? 'selected' : ''}>Presencial / Remoto</option>
      </select>
    </div>
    <div id="edit-location-div" style="display:${schedule.interviewMode === 'Remoto' ? 'none' : 'flex'}; flex-direction:column; gap:0.5rem; text-align:left;">
      <span>Local: *</span>
      <select name="interview-location" ${schedule.interviewMode !== 'Remoto' ? 'required' : ''} style="padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
        <option value="Didática 7, Sala 506 (5º andar)" ${schedule.interviewLocation === 'Didática 7, Sala 506 (5º andar)' ? 'selected' : ''}>Didática 7, Sala 506 (5º andar)</option>
        <option value="Laboratório LAWD - CCET" ${schedule.interviewLocation === 'Laboratório LAWD - CCET' ? 'selected' : ''}>Laboratório LAWD - CCET</option>
      </select>
    </div>
    <span class="edit-error" style="color:var(--red-400); font-size:0.875rem; display:none;"></span>
    <div class="modal-actions" style="margin-top:1rem;">
      <button type="button" class="btn-cancel" id="btn-cancel-edit">Cancelar</button>
      <button type="submit" class="btn-confirm">Salvar</button>
    </div>
  `;

  content.appendChild(form);
  modal.appendChild(content);
  document.body.appendChild(modal);
  openModal(modal);

  const modeSelect = form.querySelector('[name="interview-mode"]');
  const locationDiv = form.querySelector('#edit-location-div');
  const locationSelect = form.querySelector('[name="interview-location"]');
  const errorSpan = form.querySelector('.edit-error');

  const dateInput = form.querySelector('input[name="date"]');
  dateInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    let formatted = value;
    if (value.length > 2) {
      formatted = \`\${value.slice(0, 2)}/\`;
      if (value.length > 4) {
        formatted += \`\${value.slice(2, 4)}/\${value.slice(4)}\`;
      } else {
        formatted += value.slice(2);
      }
    }
    e.target.value = formatted;
  });

  modeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'Remoto') {
      locationDiv.style.display = 'none';
      locationSelect.removeAttribute('required');
    } else {
      locationDiv.style.display = 'flex';
      locationSelect.setAttribute('required', 'true');
    }
  });

  form.querySelector('#btn-cancel-edit').addEventListener('click', () => {
    closeModal(modal, () => modal.remove());
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorSpan.style.display = 'none';

    const formData = new FormData(form);
    const date = formData.get('date');
    const time = formData.get('time');
    const interviewMode = formData.get('interview-mode');
    const interviewLocation = formData.get('interview-location');

    const [day, month, year] = date.split('/');
    const [hours, minutes] = time.split(':');
    
    const inputDate = new Date(year, month - 1, day);
    const parseDateEnv = (dateStr) => {
      const [y, m, d] = dateStr.split('-');
      return new Date(Number(y), Number(m) - 1, Number(d));
    };

    const periodStart = parseDateEnv(process.env.INTERVIEW_START_DATE);
    const periodEnd = parseDateEnv(process.env.INTERVIEW_END_DATE);

    if (inputDate < periodStart || inputDate > periodEnd) {
      errorSpan.textContent = "Data fora do período permitido.";
      errorSpan.style.display = 'block';
      return;
    }

    const dateTime = new Date(year, month - 1, day, hours, minutes).toISOString();

    const payload = {
      dateTime,
      interviewMode,
      interviewLocation: (interviewMode === 'Presencial' || interviewMode === 'Ambos') ? interviewLocation : undefined,
    };

    const res = await scheduleService.updateSchedule(schedule.id, payload);
    
    if (res.success !== false) {
      closeModal(modal, () => {
        modal.remove();
        window.location.reload();
      });
    } else {
      errorSpan.textContent = res.message || 'Erro ao atualizar horário';
      if (res.errors && res.errors.length > 0) {
        errorSpan.textContent = res.errors.map(err => err.message).join(' | ');
      }
      errorSpan.style.display = 'block';
    }
  });
};

const createNewSchedule = async (form, agendaContainer) => {
  const formData = new FormData(form);

  const date = formData.get('date');
  const time = formData.get('time');
  const interviewMode = formData.get('interview-mode');
  const interviewLocation = formData.get('interview-location');
  const errorMessage = form.querySelector('.error-message');

  const [day, month, year] = date.split('/');
  const [hours, minutes] = time.split(':');

  const inputDate = new Date(year, month - 1, day);

  const parseDateEnv = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const periodStart = parseDateEnv(process.env.INTERVIEW_START_DATE);
  const periodEnd = parseDateEnv(process.env.INTERVIEW_END_DATE);

  const formatToBR = (dateObj) => {
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}/${m}/${y}`;
  };

  if (inputDate < periodStart || inputDate > periodEnd) {
    const msg = `A data deve estar entre ${formatToBR(periodStart)} e ${formatToBR(periodEnd)}.`;
    if (errorMessage) {
      errorMessage.textContent = msg;
      errorMessage.style.display = 'block';
    } else {
      alert(msg);
    }
    return;
  }

  const dateTime = new Date(year, month - 1, day, hours, minutes).toISOString();

  const response = await scheduleService.createSchedule({
    dateTime,
    interviewMode,
    interviewLocation: (interviewMode === 'Presencial' || interviewMode === 'Ambos') ? interviewLocation : undefined,
  });

  if (!response.success) {
    let errorMsg = response.message || 'Ocorreu um erro ao criar o horário';
    if (response.errors && response.errors.length > 0) {
      errorMsg = response.errors.map((err) => err.message).join(' | ');
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

export const applyCalendarDayEvents = (calendarContainer) => {
  const dateInput = calendarContainer.querySelector('input[name="date"]');
  const interviewPeriodList =
    calendarContainer.querySelectorAll('.interview-period');

  interviewPeriodList.forEach((element, _, periodList) =>
    element.addEventListener('click', () => {
      periodList.forEach((period) => period.removeAttribute('id'));

      element.id = 'selected-day';

      updateDateOnCalendarClick(dateInput, element);
    }),
  );
};

export const applyCalendarEvents = (calendarContainer, agendaContainer) => {
  const dateInput = calendarContainer.querySelector('input[name="date"]');
  const days = calendarContainer.querySelector('.days');

  dateInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);

    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.slice(0, 2)}/`;
      if (value.length > 4) {
        formatted += `${value.slice(2, 4)}/${value.slice(4)}`;
      } else {
        formatted += value.slice(2);
      }
    }
    e.target.value = formatted;
  });

  dateInput.addEventListener('change', (event) => {
    const val = event.target.value;
    if (val.length === 10) {
      const [dayStr, monthStr, yearStr] = val.split('/');
      updateCalendarOnDateInputChange(
        days,
        new Date(`${yearStr}-${monthStr}-${dayStr}T00:00:00`),
      );
    }
  });

  applyCalendarDayEvents(calendarContainer);

  const modeRadios = calendarContainer.querySelectorAll('input[name="interview-mode"]');
  const locationDiv = calendarContainer.querySelector('#form-location');
  const locationInputs = locationDiv.querySelectorAll('input[type="radio"]');
  
  modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const mode = e.target.value;
      if (mode === 'Presencial' || mode === 'Ambos') {
        locationDiv.style.display = 'flex';
        locationInputs.forEach(input => input.setAttribute('required', 'true'));
      } else {
        locationDiv.style.display = 'none';
        locationInputs.forEach(input => input.removeAttribute('required'));
      }
    });
  });

  calendarContainer
    .querySelector('form')
    .addEventListener('submit', (event) => {
      event.preventDefault();
      createNewSchedule(event.target, agendaContainer);
    });
};
