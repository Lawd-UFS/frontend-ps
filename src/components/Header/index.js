import logoImg from '../../assets/images/logo-lawd.png';
import lawdImg from '../../assets/images/lawd.png';
import userImg from '../../assets/images/icon-user.png';

import { Nav } from '../Nav';
import { Profile } from '../Profile';
import './styles.css';

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

  header.appendChild(
    await Profile({ name: 'Nome Sobrenome', imgSrc: userImg }),
  );

  const links = [
    { name: 'CANDIDATOS', href: '/candidatos' },
    {
      name: 'AGENDAMENTO',
      href: '/agendamento',
    },
    { name: 'ENTREVISTA', href: '/entrevista' },
    { name: 'PERFIL', href: '#' },
  ];

  const nav = Nav(links);
  nav
    .querySelector('li > a[href="' + route + '"]')
    .parentElement.setAttribute('active', '');

  header.querySelector('.icons').insertAdjacentElement('afterend', nav);

  return header;
};
