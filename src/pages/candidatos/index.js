import { authenticationService } from '../../service/AuthenticationService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import './index.css';
import { Header } from '../../components/Header';
import { HttpClient, HttpMethod } from '../../infra/http/httpClient';
import { Profile } from '../../components/Profile';

const httpClient = HttpClient.create();

const getAllCandidates = async () => {
  try {
    const { data: response } = await httpClient.sendRequest({
      endpoint: '/candidatos',
      method: HttpMethod.GET,
      headers: {
        Authorization: authenticationService.getToken(),
      },
    });

    return response.data;
  } catch (error) {
    if (error.status === 401) {
      alert('Sessão expirada, faça o login novamente.');
      authenticationService.logout();
      return;
    }

    alert('Ocorreu um erro na busca de candidatos.');
    return [];
  }
};

const orderCandidates = (candidates) => {
  return candidates.sort((a, b) => {
    const scoreA = Number(a.querySelector('.score').innerText) || 0;
    const scoreB = Number(b.querySelector('.score').innerText) || 0;

    return scoreB - scoreA;
  });
};

const setRanking = (candidates) => {
  candidates.forEach((candidate, index) => {
    if (index === 0) {
      candidate.querySelector('.ranking').innerText = 1;
      return;
    }

    const score = Number(candidate.querySelector('.score').innerText) || 0;
    const previousScore =
      Number(candidates[index - 1].querySelector('.score').innerText) || 0;
    const previousRanking =
      Number(candidates[index - 1].querySelector('.ranking').innerText) || 0;

    if (score === previousScore) {
      candidate.querySelector('.ranking').innerText = previousRanking;
    } else {
      candidate.querySelector('.ranking').innerText = index + 1;
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const header = await Header();

  document.body.prepend(header);

  const tbody = document.querySelector('tbody');
  const headerInfo = document.querySelector('.table_header_right_side');

  const total = document.createElement('p');

  const candidates = await getAllCandidates();

  total.innerText = `Total: ${candidates.length}`;
  headerInfo.appendChild(total);

  const loadedCandidates = await Promise.all(
    candidates.map(async (candidate) => {
      const tr = document.createElement('tr');

      if (candidate.status === 'eliminado') {
        tr.style.color = 'red';
      }

      tr.innerHTML = `<td>${candidate.status.capitalize()}</td>`;

      const profile = await Profile(
        {
          name: candidate.name,
          imgSrc: candidate.profilePhotoUrl,
        },
        'td',
      );

      profile.classList.remove('profile');
      profile.classList.add('table_profile');

      tr.appendChild(profile);
      tr.innerHTML += `
      <td class="score">${candidate.score}</td>
      <td class="ranking">-</td>
    `;

      return tr;
    }),
  );

  const orderedCandidates = orderCandidates(loadedCandidates);

  setRanking(orderedCandidates);

  orderedCandidates.forEach((candidate) => {
    tbody.appendChild(candidate);
  });
});
