import './styles.css';

import arrow from '../../../assets/images/arrow-schedule.png';

import Interview from '../../../components/Interview';
import {
  fetchInterviewCandidate,
  fetchInterviewEvaluator,
  fetchInterviewDate,
} from '../interviewHandler';
import { Profile } from '../../../components/Profile';

const togglePresence = (event) => {
  const optionClicked = event.currentTarget;
  const presenceCheckbox = optionClicked.parentElement.parentElement;

  const value = optionClicked.getAttribute('data-value');
  presenceCheckbox.checked = value;

  presenceCheckbox
    .querySelector('label span[active]')
    .removeAttribute('active');
  optionClicked.setAttribute('active', '');
};

export const AboutPage = async () => {
  const div = document.createElement('div');
  div.setAttribute('id', 'about');

  const aboutPageLink = document.getElementById('about-link');
  aboutPageLink.setAttribute('active', '');

  const interviewDate = await fetchInterviewDate();

  const card = document.createElement('div');
  card.setAttribute('id', 'about-content');

  const scheduleHeader = document.createElement('header');

  scheduleHeader.innerHTML = `
  <span>
    <img src="${arrow}" alt="arrow" class="arrow" />
    <h3>Agendamento</h3>
  </span>
  `;

  const time = Interview.Time(interviewDate);
  scheduleHeader.appendChild(time);

  const scheduleParticipants = document.createElement('div');
  scheduleParticipants.setAttribute('id', 'participants');

  scheduleParticipants.innerHTML = `
  <section id="candidate">
    <h3>Entrevistado</h3>
    <div class="participant">
      <div id="presence">
        <span>Presença confirmada?</span>
        <input type="checkbox" id="presence-checkbox"/>
        <label for="presence-checkbox">
          <span data-value="true">Sim</span>
          <span data-value="false" active>Não</span>
        </label>
      </div>
    </div>
  </section>
  <section id="interviewer">
    <h3>Entrevistador</h3>
    <div class="participant">
    </div>
  </section>
  `;

  const candidate = await fetchInterviewCandidate();
  const evaluator = await fetchInterviewEvaluator();

  const candidateProfile = await Profile({
    name: candidate.name,
    imgSrc: candidate.profilePhotoUrl,
  });
  const interviewerProfile = await Profile({
    name: evaluator.name,
    imgSrc: evaluator.photo,
  });

  scheduleParticipants
    .querySelector('#candidate .participant')
    .prepend(candidateProfile);

  scheduleParticipants
    .querySelector('#interviewer .participant')
    .appendChild(interviewerProfile);

  const formatPhone = (p) => {
    if (!p) return '';
    return p.length === 11 ? `(${p.slice(0,2)}) ${p.slice(2,7)}-${p.slice(7)}` : p;
  };

  const candidateExtraDetails = document.createElement('div');
  candidateExtraDetails.className = 'candidate-extra-details';
  candidateExtraDetails.innerHTML = `
    <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; font-size: 1.4rem; color: #4b5563;">
      ${candidate.preferredName ? `<div><strong>Como gostaria de ser chamado(a):</strong> ${candidate.preferredName}</div>` : ''}
      ${candidate.interviewPronouns ? `<div><strong>Pronomes:</strong> ${candidate.interviewPronouns}</div>` : ''}
      ${candidate.discord ? `<div><strong>Discord:</strong> ${candidate.discord}</div>` : ''}
      ${candidate.phone ? `<div><strong>Telefone:</strong> ${formatPhone(candidate.phone)}</div>` : ''}
    </div>
  `;

  scheduleParticipants.querySelector('#candidate').appendChild(candidateExtraDetails);

  const presenceOptions = Array.from(
    scheduleParticipants.querySelectorAll('#presence label span'),
  );

  presenceOptions.forEach((option) => {
    option.addEventListener('click', togglePresence);
  });

  card.appendChild(scheduleHeader);
  card.appendChild(scheduleParticipants);

  div.appendChild(card);

  return div;
};
