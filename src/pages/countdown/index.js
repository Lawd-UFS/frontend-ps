import './index.css';

const inicioPS = new Date('2025-02-24T00:00:00');

function count() {
  const dataSystem = new Date();
  const time = inicioPS - dataSystem;

  const daysT = Math.floor(time / (1000 * 60 * 60 * 24));
  const hoursT = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesT = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const secondsT = Math.floor((time % (1000 * 60)) / 1000);

  document.getElementById('day').textContent = daysT < 10 ? `0${daysT}` : daysT;
  document.getElementById('hours').textContent =
    hoursT < 10 ? `0${hoursT}` : hoursT;
  document.getElementById('minutes').textContent =
    minutesT < 10 ? `0${minutesT}` : minutesT;
  document.getElementById('seconds').textContent =
    secondsT < 10 ? `0${secondsT}` : secondsT;

  if (time > 0) setTimeout(count, 1000);
}

count();
