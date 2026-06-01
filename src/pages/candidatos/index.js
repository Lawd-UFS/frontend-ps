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

const getAllUsers = async () => {
  try {
    const { data: response } = await httpClient.sendRequest({
      endpoint: '/users',
      method: HttpMethod.GET,
      headers: {
        Authorization: authenticationService.getToken(),
      },
    });
    return response.data || [];
  } catch (error) {
    console.error('Erro na busca de usuários:', error);
    return [];
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const header = await Header();

  document.body.prepend(header);

  const tbody = document.querySelector('tbody');
  const headerInfo = document.querySelector('.table_header_right_side');

  const total = document.createElement('p');

  const candidates = await getAllCandidates();
  const users = await getAllUsers();

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
      
      const user = users.find(u => u._id === candidate.user || u._id === candidate.userId);
      const emailText = user && user.email ? user.email : '-';

      const phoneText = candidate.phone ? candidate.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : '-';
      tr.innerHTML += `
      <td>${emailText}</td>
      <td>${phoneText}</td>
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

  // Filtros
  const filters = { scheduling: false, done: false, deleted: false };
  const filterButtons = {
    scheduling: document.querySelector('.scheduling_button'),
    done: document.querySelector('.done_button'),
    deleted: document.querySelector('.delete_button')
  };

  const applyFilters = () => {
    orderedCandidates.forEach((tr, index) => {
      // O objeto original está em `candidates` mas precisamos relacionar com o `tr`.
      // Como não retornamos o objeto junto, podemos inferir os dados pela linha gerada.
      const statusText = tr.querySelector('td:nth-child(1)').innerText.toLowerCase();
      const scoreText = tr.querySelector('.score').innerText;
      
      const isEliminado = statusText === 'eliminado';
      const scoreVal = Number(scoreText) || 0;
      const isDone = scoreVal > 0;
      const isScheduling = !isDone;

      const anyFilterActive = filters.scheduling || filters.done || filters.deleted;
      
      if (!anyFilterActive) {
        tr.style.display = '';
        return;
      }

      let show = false;
      if (filters.scheduling && isScheduling && !isEliminado) show = true;
      if (filters.done && isDone && !isEliminado) show = true;
      if (filters.deleted && isEliminado) show = true;

      tr.style.display = show ? '' : 'none';
    });
  };

  Object.keys(filterButtons).forEach(key => {
    const btn = filterButtons[key];
    if (btn) {
      btn.style.cursor = 'pointer';
      btn.style.transition = 'all 0.2s ease';
      btn.addEventListener('click', () => {
        filters[key] = !filters[key];
        btn.classList.toggle('active', filters[key]);
        applyFilters();
      });
    }
  });
});
