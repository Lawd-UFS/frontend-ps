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
  time.appendChild(Interview.Time(dateTime));

  const status = document.createElement('td');
  status.className = `status ${getStatusClass(schedule.interviewStatus)}`;
  status.innerHTML = `
    <span>${schedule.interviewStatus}</span>
  `;

  const mode = document.createElement('td');
  mode.className = 'mode';

  mode.innerHTML = `
    <span>${schedule.interviewMode}</span>
  `;

  const candidate = document.createElement('td');

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
});
