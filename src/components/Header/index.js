import logoImg from '../../assets/images/logo-lawd.png';
import lawdImg from '../../assets/images/lawd.png';
import userImg from '../../assets/images/icon-user.png';

import { Nav } from '../Nav';
import { Profile } from '../Profile';
import './styles.css';

export const Header = () => {
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

  header.appendChild(Profile({ name: 'Nome Sobrenome', imgSrc: userImg }));

  const links = [
    { name: 'CANDIDATOS', href: '/candidates' },
    {
      name: 'AGENDAMENTO',
      href: '/schedule',
    },
    { name: 'ENTREVISTA', href: '/interview' },
    { name: 'PERFIL', href: '/profile' },
  ];

  const nav = Nav(links);

  header.querySelector('.icons').insertAdjacentElement('afterend', nav);

  return header;
};
