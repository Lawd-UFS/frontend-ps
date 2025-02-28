import './styles.css';

import profileImage from '../../../assets/images/icon-user.png';
import arrow from '../../../assets/images/arrow-schedule.png';

import Interview from '../../../components/Interview';
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

export const AboutPage = () => {
  const div = document.createElement('div');
  div.setAttribute('id', 'about');

  const interviewDateTime = new Date(2025, 0, 20, 15);

  const aboutPageLink = document.getElementById('about-link');
  aboutPageLink.setAttribute('active', '');

  const card = document.createElement('div');
  card.setAttribute('id', 'about-content');

  const scheduleHeader = document.createElement('header');

  scheduleHeader.innerHTML = `
  <span>
    <img src="${arrow}" alt="arrow" class="arrow" />
    <h3>Agendamento</h3>
  </span>
  `;

  scheduleHeader.appendChild(Interview.Time(interviewDateTime));

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

  scheduleParticipants
    .querySelector('#candidate .participant')
    .prepend(Profile({ name: 'Nome Participante', imgSrc: profileImage }));

  scheduleParticipants
    .querySelector('#interviewer .participant')
    .appendChild(Profile({ name: 'Nome Entrevistador', imgSrc: profileImage }));

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
