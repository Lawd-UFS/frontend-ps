import { authenticationService } from '../../service/AuthenticationService';
import { ScheduleService } from '../../service/ScheduleService';
import { HttpClient } from '../../infra/http/httpClient';
import { stateService } from '../../service/StateService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import './index.css';
import { Header } from '../../components/Header';
import { fetchAllSchedules } from '../minha-agenda/scheduleHandler';
import Interview from '../../components/Interview';
import { Profile } from '../../components/Profile';

const scheduleService = new ScheduleService(
  HttpClient.create(),
  authenticationService.getToken()
);

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
  actions.setAttribute('data-label', 'Ações');

  if (!schedule.candidate.isEmpty() && schedule.candidate.id) {
    const currentUser = authenticationService.getUserData();
    const isOwner = currentUser && (currentUser.id === schedule.evaluator.id || currentUser.name === schedule.evaluator.name);
    const isPending = schedule.interviewStatus === 'Pendente';
    const isFuture = new Date(schedule.dateTime) >= new Date();
    const isCompleted = schedule.interviewStatus === 'Concluída';

    const isTakeoverValid = isPending && !isOwner && isFuture;
    const isEditValid = isCompleted && isOwner;

    const takeoverBtnHtml = `
      <button type="button" class="takeover-btn" title="Assumir Entrevista" style="${isTakeoverValid ? '' : 'display: none;'}">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <polyline points="16 11 18 13 22 9"></polyline>
        </svg>
        <span class="takeover-btn__label">Assumir</span>
      </button>
    `;

    const editBtnHtml = `
      <button type="button" class="edit-btn" title="Editar Avaliação" style="${isEditValid ? '' : 'display: none;'}">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span class="edit-btn__label">Editar</span>
      </button>
    `;

    actions.innerHTML = `
      <div class="actions-container">
        <button type="button" class="view-profile-btn" title="Ver perfil completo">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <span class="view-profile-btn__label">Ver mais</span>
        </button>
        ${editBtnHtml}
        ${takeoverBtnHtml}
      </div>
    `;

    const viewBtn = actions.querySelector('.view-profile-btn');
    viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `/candidatos/${schedule.candidate.id}`;
    });

    const takeoverBtn = actions.querySelector('.takeover-btn');
    if (takeoverBtn && isTakeoverValid) {
      takeoverBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm(`Deseja realmente assumir a entrevista de ${schedule.candidate.name}?`)) {
          return;
        }

        takeoverBtn.disabled = true;
        
        const response = await scheduleService.takeoverSchedule(schedule.id);
        if (response.success) {
          const toast = document.createElement('div');
          toast.className = 'status-toast status-toast--success';
          toast.textContent = 'Você assumiu a entrevista com sucesso!';
          document.body.appendChild(toast);
          setTimeout(() => {
            toast.remove();
            window.location.reload();
          }, 1500);
        } else {
          takeoverBtn.disabled = false;
          alert(response.message || 'Erro ao assumir entrevista');
        }
      });
    }

    const editBtn = actions.querySelector('.edit-btn');
    if (editBtn && isEditValid) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stateService.saveState('interview', {
          status: 'edit',
          candidate: schedule.candidate,
          evaluator: schedule.evaluator ?? authenticationService.getUserData(),
          date: schedule.dateTime,
        });
        window.history.pushState({}, '', `/entrevista/${schedule.candidate.id}`);
        window.location.reload();
      });
    }
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
