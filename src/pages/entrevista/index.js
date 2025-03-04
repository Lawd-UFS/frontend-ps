import { authenticationService } from '../../service/AuthenticationService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import { Nav } from '../../components/Nav';
import { Header } from '../../components/Header';
const loadApplyPage = () =>
  import('./apply').then((module) => module.ApplyPage);
const loadAboutPage = () =>
  import('./about').then((module) => module.AboutPage);
const loadResultPage = () =>
  import('./result').then((module) => module.ResultPage);
import './index.css';

const pageContent = document.body.querySelector('#page-content');

const changePage = (page) => async (event) => {
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
  const nextPage = await page();

  nextPage.classList.add(`slide-in-to-${animationDirection}`);

  pageContent.appendChild(nextPage);

  activePage.classList.add(`slide-out-to-${animationDirection}`);

  activePageLink.removeAttribute('active');

  setTimeout(() => {
    nextPage.classList.remove(`slide-in-to-${animationDirection}`);

    activePage.remove();
  }, 500);
};

document.addEventListener('DOMContentLoaded', async () => {
  const header = await Header();

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

  nav.querySelector('#apply-link').addEventListener('click', async (event) => {
    const ApplyPage = await loadApplyPage();
    await changePage(ApplyPage)(event);
  });
  nav.querySelector('#about-link').addEventListener('click', async (event) => {
    const AboutPage = await loadAboutPage();
    await changePage(AboutPage)(event);
  });
  nav.querySelector('#result-link').addEventListener('click', async (event) => {
    const ResultPage = await loadResultPage();
    await changePage(ResultPage)(event);
  });

  document.body.prepend(nav);
  document.body.prepend(header);

  const ApplyPage = await loadApplyPage();
  pageContent.appendChild(await ApplyPage());
});
