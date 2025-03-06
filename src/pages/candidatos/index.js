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

document.addEventListener('DOMContentLoaded', async () => {
  const header = await Header();

  document.body.prepend(header);

  const tbody = document.querySelector('tbody');
  const headerInfo = document.querySelector('.table_header_right_side');

  const total = document.createElement('p');

  const candidates = await getAllCandidates();

  total.innerText = `Total: ${candidates.length}`;
  headerInfo.appendChild(total);

  candidates.forEach(async (candidate) => {
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
      <td>-</td>
      <td>-</td>
      <td>-</td>
    `;

    tbody.appendChild(tr);
  });
});
