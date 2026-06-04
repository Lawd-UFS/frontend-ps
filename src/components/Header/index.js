import { authenticationService } from '../../service/AuthenticationService';
import logoImg from '../../assets/images/logo-lawd.png';
import lawdImg from '../../assets/images/lawd.png';

import { Nav } from '../Nav';
import { Profile } from '../Profile';
import './styles.css';

const setActiveLink = (nav, currentPath) => {
  const links = Array.from(nav.querySelectorAll('li > a'));

  const activeLink = links.find((link) => {
    const href = link.getAttribute('href');
    return currentPath.startsWith(href);
  });

  if (activeLink) {
    activeLink.parentElement.setAttribute('active', '');
  }
};

export const Header = async () => {
  const route = window.location.pathname;

  const header = document.createElement('header');
  header.setAttribute('class', 'header');

  header.innerHTML = `
        <div class="icons">
        </div>
    `;

  const imgLogo = document.createElement('img');
  imgLogo.src = logoImg;
  imgLogo.setAttribute('class', 'img-icon');

  const imgLawd = document.createElement('img');
  imgLawd.src = lawdImg;
  imgLawd.setAttribute('class', 'img-lawd');

  header.querySelector('.icons').appendChild(imgLogo);
  header.querySelector('.icons').appendChild(imgLawd);

  const user = authenticationService.getUserData();

  header.appendChild(await Profile({ name: user.name, imgSrc: user.photo }));

  const links = [
    { name: 'CANDIDATOS', href: '/candidatos' },
    {
      name: 'MINHA AGENDA',
      href: '/minha-agenda',
    },
    { name: 'AGENDAMENTO GERAL', href: '/agendamento-geral' },
    { name: 'ENTREVISTA', href: '/entrevista' },
  ];

  const nav = Nav(links);
  setActiveLink(nav, route);

  header.querySelector('.icons').insertAdjacentElement('afterend', nav);

  // Add mobile hamburger button
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger-btn';
  hamburger.setAttribute('aria-label', 'Menu');
  hamburger.innerHTML = `
    <span class="hamburger-btn__bars" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </span>
  `;
  header.appendChild(hamburger);

  hamburger.addEventListener('click', () => {
    nav.classList.toggle('nav-active');
    hamburger.classList.toggle('hamburger-active');
  });

  const applyFixedHeaderLayout = () => {
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    document.body.classList.toggle('has-fixed-header', isMobile);
  };

  applyFixedHeaderLayout();
  window.addEventListener('resize', applyFixedHeaderLayout);

  return header;
};
