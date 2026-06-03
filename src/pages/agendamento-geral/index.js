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

  mode.innerHTML = `
    <span>${schedule.interviewMode}</span>
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

  tr.appendChild(time);
  tr.appendChild(candidate);
  tr.appendChild(evaluator);
  tr.appendChild(mode);
  tr.appendChild(status);

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
  const filters = { pending: false, completed: false, presential: false, remote: false };
  const filterButtons = {
    pending: document.querySelector('.filter-button.pending'),
    completed: document.querySelector('.filter-button.completed'),
    presential: document.querySelector('.filter-button.presential'),
    remote: document.querySelector('.filter-button.remote')
  };

  const applyFilters = () => {
    scheduleItems.forEach(({ tr, schedule }) => {
      const isStatusPending = schedule.interviewStatus === 'Pendente';
      const isStatusCompleted = schedule.interviewStatus === 'Concluída';
      // Considera 'Ambos' como válido para presencial ou remoto
      const isModePresential = schedule.interviewMode === 'Presencial' || schedule.interviewMode === 'Ambos';
      const isModeRemote = schedule.interviewMode === 'Remoto' || schedule.interviewMode === 'Ambos';

      const statusFilterActive = filters.pending || filters.completed;
      const statusMatch = !statusFilterActive || 
                          (filters.pending && isStatusPending) || 
                          (filters.completed && isStatusCompleted);

      const modeFilterActive = filters.presential || filters.remote;
      const modeMatch = !modeFilterActive || 
                        (filters.presential && isModePresential) || 
                        (filters.remote && isModeRemote);

      if (statusMatch && modeMatch) {
        tr.style.display = '';
      } else {
        tr.style.display = 'none';
      }
    });
  };

  Object.keys(filterButtons).forEach(key => {
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
