import './index.css';

var textWrapper = document.querySelector('.title');
textWrapper.innerHTML = textWrapper.textContent.replace(
  /\S/g,
  "<span class='letter'>$&</span>",
);

anime.timeline({ autoplay: true }).add({
  targets: '.title .letter',
  translateY: [100, 0],
  translateZ: 0,
  opacity: [0, 1],
  easing: 'easeOutExpo',
  duration: 1400,
  delay: (el, i) => 300 + 30 * i,
});

document.querySelectorAll('.support-text').forEach((textWrapper, index) => {
  textWrapper.innerHTML = textWrapper.textContent.replace(
    /\S/g,
    "<span class='tagline'>$&</span>",
  );

  // Adiciona um atraso antes de iniciar a animação
  setTimeout(() => {
    anime
      .timeline({ loop: true })
      .add({
        targets: textWrapper.querySelectorAll('.tagline'),
        translateX: [40, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 1200,
        delay: (el, i) => 500 + 30 * i, // Delay por letra
      })
      .add({
        targets: textWrapper.querySelectorAll('.tagline'),
        translateX: [0, -30],
        opacity: [1, 0],
        easing: 'easeInExpo',
        duration: 1100,
        delay: (el, i) => 100 + 30 * i,
      });
  }, index * 1031); // Atraso diferente para cada bloco de texto
});
