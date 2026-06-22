import { authenticationService } from '../../service/AuthenticationService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import './index.css';
import { Header } from '../../components/Header';
import { fetchAllSchedules } from '../minha-agenda/scheduleHandler';
import Interview from '../../components/Interview';
import { Profile } from '../../components/Profile';

const getStatusClass = (status) => {
  if (status === 'Pendente') return 'pending';
  if (status === 'Concluída') return 'completed';
  return '';
};

const createScheduleItem = async (schedule) => {
  const tr = document.createElement('tr');

  const dateTime = new Date(schedule.dateTime);
  const time = document.createElement('td');
  time.className = 'time';
  time.setAttribute('data-label', 'Horário');
  time.appendChild(Interview.Time(dateTime));

  const status = document.createElement('td');
  status.className = `status ${getStatusClass(schedule.interviewStatus)}`;
  status.setAttribute('data-label', 'Status');
  status.innerHTML = `
    <span>${schedule.interviewStatus}</span>
  `;

  const mode = document.createElement('td');
  mode.className = 'mode';
  mode.setAttribute('data-label', 'Modalidade');

  let locationText = '';
  if (
    (schedule.interviewMode === 'Presencial' || schedule.interviewMode === 'Ambos') &&
    schedule.interviewLocation
  ) {
    locationText = ` no ${schedule.interviewLocation === 'Didática 7, Sala 506 (5º andar)' ? 'Sala 506' : 'LAWD'}`;
  }

  mode.innerHTML = `
    <span>${schedule.interviewMode}${locationText}</span>
  `;

  const candidate = document.createElement('td');
  candidate.setAttribute('data-label', 'Candidato');

  if (!schedule.candidate.isEmpty()) {
    candidate.className = 'candidate';
    const candidateProfile = await Profile({
      name: schedule.candidate.name,
      imgSrc: schedule.candidate.profilePhotoUrl,
    });
    candidate.appendChild(candidateProfile);
  } else {
    candidate.className = 'no-candidate';
    candidate.innerHTML = `
      <span>-</span>
    `;
  }

  const evaluator = document.createElement('td');
  evaluator.className = 'evaluator';
  evaluator.setAttribute('data-label', 'Avaliador');

  const evaluatorProfile = await Profile({
    name: schedule.evaluator.name,
    imgSrc: schedule.evaluator.photo,
  });
  evaluator.appendChild(evaluatorProfile);

  const actions = document.createElement('td');
  actions.className = 'actions-cell';
  actions.setAttribute('data-label', 'Ver mais');

  if (!schedule.candidate.isEmpty() && schedule.candidate.id) {
    actions.innerHTML = `
      <button type="button" class="view-profile-btn" title="Ver perfil completo">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <span class="view-profile-btn__label">Ver mais</span>
      </button>
    `;

    const viewBtn = actions.querySelector('.view-profile-btn');
    viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `/candidatos/${schedule.candidate.id}`;
    });
  } else {
    actions.innerHTML = '<span>-</span>';
  }

  tr.appendChild(time);
  tr.appendChild(candidate);
  tr.appendChild(evaluator);
  tr.appendChild(mode);
  tr.appendChild(status);
  tr.appendChild(actions);

  return { tr, schedule };
};

document.addEventListener('DOMContentLoaded', async () => {
  const header = await Header();
  document.body.prepend(header);

  const schedulesListContainer = document.querySelector('tbody');
  const schedules = await fetchAllSchedules();

  const scheduleItems = await Promise.all(
    schedules.map(async (schedule) => {
      return await createScheduleItem(schedule);
    }),
  );

  scheduleItems.sort((a, b) => {
    const dateA = new Date(a.schedule.dateTime);
    const dateB = new Date(b.schedule.dateTime);

    return dateA - dateB;
  });

  scheduleItems.forEach((item) => {
    schedulesListContainer.appendChild(item.tr);
  });

  // Filtros
  const filters = {
    pending: false,
    completed: false,
    presential: false,
    remote: false,
  };
  const filterButtons = {
    pending: document.querySelector('.filter-button.pending'),
    completed: document.querySelector('.filter-button.completed'),
    presential: document.querySelector('.filter-button.presential'),
    remote: document.querySelector('.filter-button.remote'),
  };

  const applyFilters = () => {
    scheduleItems.forEach(({ tr, schedule }) => {
      const isStatusPending = schedule.interviewStatus === 'Pendente';
      const isStatusCompleted = schedule.interviewStatus === 'Concluída';
      // Considera 'Ambos' como válido para presencial ou remoto
      const isModePresential =
        schedule.interviewMode === 'Presencial' ||
        schedule.interviewMode === 'Ambos';
      const isModeRemote =
        schedule.interviewMode === 'Remoto' ||
        schedule.interviewMode === 'Ambos';

      const statusFilterActive = filters.pending || filters.completed;
      const statusMatch =
        !statusFilterActive ||
        (filters.pending && isStatusPending) ||
        (filters.completed && isStatusCompleted);

      const modeFilterActive = filters.presential || filters.remote;
      const modeMatch =
        !modeFilterActive ||
        (filters.presential && isModePresential) ||
        (filters.remote && isModeRemote);

      if (statusMatch && modeMatch) {
        tr.style.display = '';
      } else {
        tr.style.display = 'none';
      }
    });
  };

  Object.keys(filterButtons).forEach((key) => {
    const btn = filterButtons[key];
    if (btn) {
      btn.addEventListener('click', () => {
        filters[key] = !filters[key];
        btn.classList.toggle('active', filters[key]);
        applyFilters();
      });
    }
  });
});
