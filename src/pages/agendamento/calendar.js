import coffeeSvg from '../../assets/images/coffee.svg';
import computerSvg from '../../assets/images/computer.svg';
import coffeeAndComputerSvg from '../../assets/images/coffee-and-computer.svg';
import {
  fetchSchedules,
  updateScheduleDetailsOnScheduleClick,
} from './scheduleHandler';
import Interview from '../../components/Interview';

export const getScheduleStatus = (schedule) => {
  const now = new Date();
  const scheduleDateTime = new Date(schedule.dateTime);

  if (scheduleDateTime < now) {
    return 'past';
  }

  if (schedule.isAvailable) {
    return 'available';
  }

  return 'scheduled';
};

/**
 * Gera os dados do calendário para o mês atual.
 *
 * @param {Array<string>} monthNames - Um array com os nomes dos meses.
 * @returns {Object} Um objeto contendo o nome do mês atual e um array de semanas, onde cada semana é um array de dias.
 * @property {string} month - O nome do mês atual.
 * @property {Array<Array<number>>} weeks - Um array de semanas, onde cada semana é um array de dias.
 */
const getCalendarData = (periodMonthStart, periodMonthEnd) => {
  const date = new Date('2025-03-01T00:00:00');
  const month = date.getMonth();
  const year = date.getFullYear();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInLastMonth = new Date(year, month, 0).getDate();

  const weeks = Array.from({ length: 6 }).map(() => Array.from({ length: 7 }));

  let weekIndex = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObject = new Date(year, month, day);
    const weekDayIndex = dateObject.getDay();
    weeks[weekIndex][weekDayIndex] = {
      day,
      periodMonth: periodMonthStart <= month && month <= periodMonthEnd,
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
  const periodStartMonth = periodStart.getMonth();
  const periodStartDay = periodStart.getDate() + 1;
  const periodEndMonth = periodEnd.getMonth();
  const periodEndDay = periodEnd.getDate() + 1;

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

  const { weeks, month } = getCalendarData(periodStartMonth, periodEndMonth);

  const monthH2 = container.querySelector('.month');
  monthH2.textContent = months[month];

  const days = container.querySelector('.days');

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
        if (day >= periodStartDay && day <= periodEndDay) {
          dayLi.classList.add('interview-period');
        }
      }

      ul.appendChild(dayLi);
    });

    days.appendChild(ul);
  });

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
  const schedules = await fetchSchedules();

  schedules.forEach((schedule) => {
    addNewScheduleTime(
      schedule,
      container,
      updateScheduleDetailsOnScheduleClick,
    );
  });
};
