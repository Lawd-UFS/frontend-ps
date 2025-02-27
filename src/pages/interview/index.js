import { authenticationService } from '../../service/AuthenticationService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import { Nav } from '../../components/Nav';
import { Header } from '../../components/Header';
import { ApplyPage } from './apply';
import { AboutPage } from './about';
import { ResultPage } from './result';
import './index.css';

const pageContent = document.body.querySelector('#page-content');

const changePage = (page) => (event) => {
  if (pageContent.children.length > 1) {
    return;
  }

  const nextPageListItem = event.currentTarget;
  const activePageLink = document.querySelector('nav.interview li[active]');

  if (activePageLink === nextPageListItem) {
    return;
  }

  const pageLinksList = Array.from(
    document.querySelectorAll('nav.interview li'),
  );

  const animationDirection =
    pageLinksList.indexOf(activePageLink) -
      pageLinksList.indexOf(nextPageListItem) >
    0
      ? 'right'
      : 'left';

  const activePage = document.querySelector('main > div');
  const nextPage = page();

  nextPage.classList.add(`slide-in-to-${animationDirection}`);

  pageContent.appendChild(nextPage);

  activePage.classList.add(`slide-out-to-${animationDirection}`);

  activePageLink.removeAttribute('active');

  setTimeout(() => {
    nextPage.classList.remove(`slide-in-to-${animationDirection}`);

    activePage.remove();
  }, 500);
};

const changeToApplyPage = changePage(ApplyPage);
const changeToAboutPage = changePage(AboutPage);
const changeToResultPage = changePage(ResultPage);

const header = Header();
const nav = Nav(
  [
    {
      name: 'Aplicação',
      id: 'apply-link',
    },
    {
      name: 'Sobre',
      id: 'about-link',
    },
    {
      name: 'Resultado',
      id: 'result-link',
    },
  ],
  'interview',
);

nav.querySelector('#apply-link').addEventListener('click', changeToApplyPage);
nav.querySelector('#about-link').addEventListener('click', changeToAboutPage);
nav.querySelector('#result-link').addEventListener('click', changeToResultPage);

document.body.prepend(nav);
document.body.prepend(header);

pageContent.appendChild(ApplyPage());
