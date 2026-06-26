import { authenticationService } from '../../service/AuthenticationService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import { Nav } from '../../components/Nav';
import { Header } from '../../components/Header';
import { fetchInterviewCandidate } from './interviewHandler';
import { stateService } from '../../service/StateService';

window.addEventListener('beforeunload', (e) => {
  const state = stateService.getState('interview');
  if (!window.isSaving && window.isDirty && state && (state.status === 'new' || state.status === 'edit')) {
    e.preventDefault();
    e.returnValue = '';
  }
});

const loadApplyPage = () =>
  import('./apply').then((module) => module.ApplyPage);
const loadResultPage = () =>
  import('./result').then((module) => module.ResultPage);
import './index.css';

const changePage = (page) => async (event) => {
  const pageContent = document.body.querySelector('#page-content');

  if (pageContent.children.length > 1) {
    return;
  }

  const nextPageListItem = event.currentTarget;
  const activePageLink = document.querySelector('nav.interview li[active]');

  if (activePageLink === nextPageListItem) {
    return;
  }

  const state = stateService.getState('interview');
  if (state && (state.status === 'new' || state.status === 'edit') && window.isDirty) {
    if (!confirm('Você tem alterações não salvas. Deseja realmente sair desta aba? Você perderá tudo que preencheu.')) {
      return;
    }
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

  const candidate = await fetchInterviewCandidate();

  if (!candidate) {
    const emptyState = document.createElement('div');
    emptyState.style.display = 'flex';
    emptyState.style.flexDirection = 'column';
    emptyState.style.alignItems = 'center';
    emptyState.style.justifyContent = 'center';
    emptyState.style.height = '60vh';
    emptyState.style.textAlign = 'center';

    emptyState.innerHTML = `
      <h2 style="color: var(--purple-400); font-size: 2.4rem; margin-bottom: 1rem;">Nenhuma Entrevista Selecionada</h2>
      <p style="color: var(--gray); font-size: 1.4rem;">Acesse a <a href="/minha-agenda" style="color: var(--purple-300); text-decoration: underline; font-weight: bold;">sua agenda</a> para selecionar uma entrevista.</p>
    `;

    document.body.prepend(header);
    document.body.querySelector('#page-content').appendChild(emptyState);
    return;
  }

  const nav = Nav(
    [
      {
        name: 'Aplicação',
        id: 'apply-link',
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
  nav.querySelector('#result-link').addEventListener('click', async (event) => {
    const ResultPage = await loadResultPage();
    await changePage(ResultPage)(event);
  });

  document.body.prepend(nav);
  document.body.prepend(header);

  const ApplyPage = await loadApplyPage();
  document.body.querySelector('#page-content').appendChild(await ApplyPage());
});
