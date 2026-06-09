import './index.css';

let dateStr = process.env.PROCESS_START_DATE;
if (!/(Z|[+-]\d{2}:\d{2})$/.test(dateStr)) {
  dateStr += '-03:00';
}
const inicioPS = new Date(dateStr);

function count() {
  const dataSystem = new Date();
  const time = inicioPS - dataSystem;

  const daysT = Math.floor(time / (1000 * 60 * 60 * 24));
  const hoursT = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesT = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const secondsT = Math.floor((time % (1000 * 60)) / 1000);

  if (time > 0) {
    document.getElementById('day').textContent =
      daysT < 10 ? `0${daysT}` : daysT;
    document.getElementById('hours').textContent =
      hoursT < 10 ? `0${hoursT}` : hoursT;
    document.getElementById('minutes').textContent =
      minutesT < 10 ? `0${minutesT}` : minutesT;
    document.getElementById('seconds').textContent =
      secondsT < 10 ? `0${secondsT}` : secondsT;

    setTimeout(count, 1000);
  } else {
    document.getElementById('day').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';

    const cdMessageDiv = document.querySelector('.cd-message');
    if (cdMessageDiv) {
      cdMessageDiv.classList.add('opened');
    }

    const cdMessage = document.querySelector('.cd-message h1');
    if (cdMessage) {
      cdMessage.innerHTML = 'As inscrições já abriram!';
    }

    // Transição para o modo de forms (página de inscrição)
    setTimeout(() => {
      window.location.href = '/inscricao';
    }, 2000);
  }
}

count();
