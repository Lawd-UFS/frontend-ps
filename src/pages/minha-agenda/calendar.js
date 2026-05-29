import coffeeSvg from '../../assets/images/coffee.svg';
import computerSvg from '../../assets/images/computer.svg';
import coffeeAndComputerSvg from '../../assets/images/coffee-and-computer.svg';
import {
  fetchEvaluatorSchedules,
  fetchOverview,
  updateScheduleDetailsOnScheduleClick,
} from './scheduleHandler';
import Interview from '../../components/Interview';

export const getScheduleStatus = (schedule) => {
  if (schedule.isAvailable) {
    return 'available';
  }

  if (schedule.interviewStatus === 'Concluída') {
    return 'past';
  }

  return 'scheduled';
};

const getPendingStatsBadge = (stats) => {
  const percentagePending = (stats.unscheduledTimes / stats.times) * 100;

  if (percentagePending >= 70) {
    return '<span>🔴</span>'; // Vermelho para muitas pendentes
  } else if (percentagePending >= 30) {
    return '<span>🟡</span>'; // Amarelo para quantidade moderada
  } else {
    return '<span>🟢</span>'; // Verde para poucas pendentes
  }
};

/**
 * Gera os dados do calendário para o mês atual.
 *
 * @param {Array<string>} monthNames - Um array com os nomes dos meses.
 * @returns {Object} Um objeto contendo o nome do mês atual e um array de semanas, onde cada semana é um array de dias.
 * @property {string} month - O nome do mês atual.
 * @property {Array<Array<number>>} weeks - Um array de semanas, onde cada semana é um array de dias.
 */
const getCalendarData = (periodStart, periodEnd, targetDate = new Date()) => {
  const month = targetDate.getMonth();
  const year = targetDate.getFullYear();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInLastMonth = new Date(year, month, 0).getDate();

  const weeks = Array.from({ length: 6 }).map(() => Array.from({ length: 7 }));

  let weekIndex = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObject = new Date(year, month, day);
    const weekDayIndex = dateObject.getDay();
    
    const isWithinPeriod = dateObject >= periodStart && dateObject <= periodEnd;

    weeks[weekIndex][weekDayIndex] = {
      day,
      periodMonth: isWithinPeriod,
      date: dateObject,
    };

    if (weekDayIndex === 6) {
      weekIndex++;
    }
  }

  // Preenche os dias faltantes da primeira semana com o mês passado
  weeks[0].forEach((element, index, week) => {
    if (!element) {
      const dayFromLastMonth = daysInLastMonth - (firstDayIndex - 1) + index;
      week[index] = { day: dayFromLastMonth, periodMonth: false };
    }
  });

  // Preenche os dias faltantes da última semana com o próximo mês
  let nextMonthDay = 1;
  weeks[weekIndex].forEach((element, index, week) => {
    if (!element) {
      week[index] = { day: nextMonthDay, periodMonth: false };
      nextMonthDay++;
    }
  });

  // Remove semanas vazias
  for (let i = weekIndex + 1; i < weeks.length; i++) {
    weeks.pop();
  }

  return {
    month,
    weeks,
  };
};

const createScheduleTime = (schedule) => {
  const dateTime = new Date(schedule.dateTime);
  const localDateTime = new Date(
    dateTime.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
  );

  const time = new Interview.Time(localDateTime, document.createElement('li'));

  time.setAttribute('status', schedule.status);

  return time;
};

export const addNewScheduleTime = (
  schedule,
  agendaContainer,
  updateDetails,
) => {
  const timeList = agendaContainer.querySelector('.schedules ul');
  const timeElements = timeList.querySelectorAll('li');
  const details = agendaContainer.querySelector('.details .content');

  schedule.status = getScheduleStatus(schedule);

  const time = createScheduleTime(schedule);

  time.addEventListener('click', () => {
    timeList
      .querySelectorAll('li')
      .forEach((li) => li.removeAttribute('selected'));

    time.setAttribute('selected', 'true');

    updateDetails(schedule, details);
  });

  let elementWasInserted = false;

  for (const element of timeElements) {
    const newElementDateTime = new Date(
      time.querySelector('time').getAttribute('datetime'),
    );

    const oldElementDateTime = new Date(
      element.querySelector('time').getAttribute('datetime'),
    );

    if (newElementDateTime < oldElementDateTime) {
      timeList.insertBefore(time, element);
      elementWasInserted = true;
      break;
    }
  }

  if (!elementWasInserted) {
    timeList.appendChild(time);
  }
};

export const createCalendar = ({ periodStart, periodEnd }, container) => {

  const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];
  const interviewFormatSvgs = [computerSvg, coffeeSvg, coffeeAndComputerSvg];

  let currentDisplayedDate = new Date();
  const monthH2 = container.querySelector('.month');
  const days = container.querySelector('.days');
  const prevMonthBtn = container.querySelector('#prev-month');
  const nextMonthBtn = container.querySelector('#next-month');

  const renderCalendar = () => {
    const { weeks, month } = getCalendarData(periodStart, periodEnd, currentDisplayedDate);
    monthH2.textContent = `${months[month]} ${currentDisplayedDate.getFullYear()}`;
    days.innerHTML = '';

    weekdays.forEach((weekday, index) => {
      const ul = document.createElement('ul');
      const li = document.createElement('li');
      li.textContent = weekday;
      li.className = 'weekday';
      ul.appendChild(li);

      weeks.forEach((week) => {
        const { day, periodMonth, date } = week[index];
        const dayLi = document.createElement('li');
        dayLi.textContent = day.toString().padStart(2, '0');

        if (date) {
          dayLi.setAttribute('data-date', date);
        }

        if (periodMonth) {
          dayLi.classList.add('interview-period');
        }

        ul.appendChild(dayLi);
      });

      days.appendChild(ul);
    });
    
    if (prevMonthBtn) {
      const now = new Date();
      if (
        currentDisplayedDate.getFullYear() < now.getFullYear() ||
        (currentDisplayedDate.getFullYear() === now.getFullYear() && currentDisplayedDate.getMonth() <= now.getMonth())
      ) {
        prevMonthBtn.style.visibility = 'hidden';
      } else {
        prevMonthBtn.style.visibility = 'visible';
      }
    }

    // Refresh date click listeners (they are bound in index.js, so we need a way to let index.js know or we can just dispatch an event)
    container.dispatchEvent(new CustomEvent('calendar-rendered'));
  };

  renderCalendar();

  if (prevMonthBtn && nextMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      const now = new Date();
      if (
        currentDisplayedDate.getFullYear() > now.getFullYear() ||
        (currentDisplayedDate.getFullYear() === now.getFullYear() && currentDisplayedDate.getMonth() > now.getMonth())
      ) {
        currentDisplayedDate.setMonth(currentDisplayedDate.getMonth() - 1);
        renderCalendar();
      }
    });
    nextMonthBtn.addEventListener('click', () => {
      currentDisplayedDate.setMonth(currentDisplayedDate.getMonth() + 1);
      renderCalendar();
    });
  }

  container
    .querySelectorAll('.toggle-group label')
    .forEach((button, index, buttons) => {
      button.insertAdjacentHTML('afterbegin', interviewFormatSvgs[index]);

      button.addEventListener('click', () => {
        buttons.forEach((btn) => btn.setAttribute('data-active', 'false'));
        button.setAttribute('data-active', 'true');
      });
    });
};

export const createSchedule = async (container) => {
  const schedules = await fetchEvaluatorSchedules();

  schedules.forEach((schedule) => {
    addNewScheduleTime(
      schedule,
      container,
      updateScheduleDetailsOnScheduleClick,
    );
  });
};

export const createOverview = async (container) => {
  const [totalContainer, evaluatorContainer] =
    container.querySelectorAll('.stats-container');

  const overview = await fetchOverview();

  const pendingStatsBadge = getPendingStatsBadge(overview.total);

  const totalTimes = overview.total.times;
  const scheduledTimes = overview.total.scheduledTimes;
  const unscheduledTimes = overview.total.unscheduledTimes;

  const totalStatsElements = totalContainer.querySelector('dl');

  totalStatsElements.innerHTML = `
    <div class="stats-item">
      <dt>Total inscritos:</dt>
      <dd>${totalTimes}</dd>
    </div>
    <div class="stats-item">
      <dt>Candidatos agendados:</dt>
      <dd>${scheduledTimes}</dd>
    </div>
    <div class="stats-item">
      <dt>Aguardando agendamento:</dt>
      <dd>${unscheduledTimes} ${pendingStatsBadge}</dd>
    </div>
  `;

  const myTimes = overview.evaluator.times;
  const myScheduledTimes = overview.evaluator.scheduledTimes;
  const myUnscheduledTimes = overview.evaluator.unscheduledTimes;

  const myStatsElements = evaluatorContainer.querySelector('dl');

  myStatsElements.innerHTML = `
    <div class="stats-item">
      <dt>Total:</dt>
      <dd>${myTimes}</dd>
    </div>
    <div class="stats-item">
      <dt>Agendados:</dt>
      <dd>${myScheduledTimes}</dd>
    </div>
    <div class="stats-item">
      <dt>Disponíveis:</dt>
      <dd>${myUnscheduledTimes}</dd>
    </div>
  `;
};
