import { authenticationService } from '../../service/AuthenticationService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import './index.css';
import { Header } from '../../components/Header';
import { HttpClient, HttpMethod } from '../../infra/http/httpClient';
import { Profile } from '../../components/Profile';

const httpClient = HttpClient.create();

const normalizeCourseName = (course) => {
  if (!course) return '';
  const normalized = course
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'cc' || normalized.includes('ciencia da computacao') || normalized.includes('ciencias da computacao') || normalized.includes('ciencia computacao') || normalized.includes('ciencias computacao')) {
    return 'Ciência da Computação';
  }
  if (normalized === 'si' || normalized.includes('sistemas de informacao') || normalized.includes('sistema de informacao') || normalized.includes('sistemas informacao') || normalized.includes('sistema informacao')) {
    return 'Sistemas de Informação';
  }
  if (normalized === 'ec' || normalized.includes('engenharia da computacao') || normalized.includes('engenharia de computacao') || normalized.includes('engenharia computacao')) {
    return 'Engenharia da Computação';
  }

  const wordCorrections = {
    'ciencia': 'Ciência',
    'ciencias': 'Ciências',
    'computacao': 'Computação',
    'sistema': 'Sistema',
    'sistemas': 'Sistemas',
    'informacao': 'Informação',
    'informacoes': 'Informações',
    'engenharia': 'Engenharia',
    'estatistica': 'Estatística',
    'matematica': 'Matemática',
    'fisica': 'Física',
    'quimica': 'Química',
    'administracao': 'Administração',
    'mecanica': 'Mecânica',
    'eletrica': 'Elétrica',
    'producao': 'Produção',
    'civil': 'Civil',
    'de': 'de',
    'da': 'da',
    'do': 'do',
    'dos': 'dos',
    'das': 'das',
    'e': 'e'
  };

  const words = normalized.split(/\s+/);
  return words
    .map(word => {
      if (wordCorrections[word]) {
        return wordCorrections[word];
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const getAllCandidates = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.name) query.append('name', params.name);
    if (params.curso) query.append('curso', params.curso);
    if (params.periodo) query.append('periodo', params.periodo);
    if (params.knowledgeLevel) query.append('knowledgeLevel', params.knowledgeLevel);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';

    const { data: response } = await httpClient.sendRequest({
      endpoint: `/candidatos${queryString}`,
      method: HttpMethod.GET,
      headers: {
        Authorization: authenticationService.getToken(),
      },
    });

    return response;
  } catch (error) {
    if (error.status === 401) {
      alert('Sessão expirada, faça o login novamente.');
      authenticationService.logout();
      return { data: [], totalPages: 1 };
    }

    alert('Ocorreu um erro na busca de candidatos.');
    return { data: [], totalPages: 1 };
  }
};

const orderCandidates = (candidates) => {
  return candidates.sort((a, b) => {
    const scoreA = Number(a.dataset.score) || 0;
    const scoreB = Number(b.dataset.score) || 0;

    return scoreB - scoreA;
  });
};

const setRanking = (candidates) => {
  candidates.forEach((candidate, index) => {
    if (index === 0) {
      candidate.querySelector('.ranking').innerText = 1;
      return;
    }

    const score = Number(candidate.dataset.score) || 0;
    const previousScore =
      Number(candidates[index - 1].dataset.score) || 0;
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
  total.style.fontWeight = 'bold';
  total.style.marginLeft = 'auto';
  headerInfo.prepend(total);

  const state = {
    name: '',
    curso: '',
    periodo: '',
    knowledgeLevel: '',
    page: 1,
    limit: 99999,
    totalPages: 1
  };

  let currentLoadedCandidates = [];

  const loadCandidates = async () => {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Carregando...</td></tr>';

    const response = await getAllCandidates(state);
    const candidates = response.data || [];
    state.totalPages = response.totalPages || 1;
    state.page = response.currentPage || state.page;

    total.innerText = `Total: ${response.totalRecords || candidates.length}`;

    tbody.innerHTML = '';

    const loadedCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        const tr = document.createElement('tr');

        const normalizedCourse = normalizeCourseName(candidate.course);
        tr.dataset.score = candidate.score || 0;
        tr.dataset.course = normalizedCourse.toLowerCase();
        tr.dataset.period = candidate.period ? candidate.period.toString() : '';

        if (candidate.status === 'eliminado') {
          tr.style.color = 'red';
        }

        tr.innerHTML = `<td data-label="Status">${candidate.status.capitalize()}</td>`;

        const profile = await Profile(
          {
            name: candidate.name,
            imgSrc: candidate.profilePhotoUrl,
          },
          'td',
        );

        profile.classList.remove('profile');
        profile.classList.add('table_profile');
        profile.setAttribute('data-label', 'Candidato');

        tr.appendChild(profile);

        const phoneText = candidate.phone ? candidate.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : '-';
        tr.innerHTML += `
        <td data-label="Telefone">${phoneText}</td>
        <td data-label="Curso">${normalizedCourse || '-'}</td>
        <td data-label="Período">${candidate.period ? `${candidate.period}º` : '-'}</td>
        <td data-label="Ranking" class="ranking">-</td>
        <td data-label="Ações">
          <button class="view-profile-btn" title="Ver Perfil Completo">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </td>
      `;

        const viewBtn = tr.querySelector('.view-profile-btn');
        viewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.location.href = `/candidatos/${candidate._id || candidate.id}`;
        });

        return tr;
      }),
    );

    const orderedCandidates = orderCandidates(loadedCandidates);
    setRanking(orderedCandidates);

    currentLoadedCandidates = orderedCandidates;

    orderedCandidates.forEach((candidate) => {
      tbody.appendChild(candidate);
    });
  };

  // Inicializa os filtros dinâmicos chamando a API uma vez com limite alto
  const initialResponse = await getAllCandidates({ limit: 99999 });
  const allCandidates = initialResponse.data || [];

  const courseFilter = document.querySelector('#filter-course');
  const periodFilter = document.querySelector('#filter-period');

  // Agrupa nomes de cursos brutos por seus nomes normalizados
  const courseGroups = {};
  allCandidates.forEach(c => {
    if (!c.course) return;
    const normalized = normalizeCourseName(c.course);
    if (!courseGroups[normalized]) {
      courseGroups[normalized] = [];
    }
    courseGroups[normalized].push(c.course);
  });

  Object.keys(courseGroups).forEach(normalized => {
    const rawValues = [...new Set(courseGroups[normalized])];
    const opt = document.createElement('option');
    opt.value = rawValues.join('|');
    opt.innerText = normalized;
    courseFilter.appendChild(opt);
  });

  // Popula períodos únicos
  const uniquePeriods = [...new Set(allCandidates.map(c => c.period ? c.period.toString() : '').filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  uniquePeriods.forEach(period => {
    const opt = document.createElement('option');
    opt.value = period;
    opt.innerText = `${period}º Período`;
    periodFilter.appendChild(opt);
  });

  // Inicializa a listagem
  await loadCandidates();

  // Controles de Busca
  const nameInput = document.querySelector('#filter-name');
  const knowledgeSelect = document.querySelector('#filter-knowledge');
  const applyFiltersBtn = document.querySelector('#apply-filters-btn');

  const executeSearch = () => {
    state.name = nameInput.value;
    state.curso = courseFilter.value;
    state.periodo = periodFilter.value;
    state.knowledgeLevel = knowledgeSelect.value;
    state.page = 1; // Reseta a paginação ao buscar
    loadCandidates();
  };

  applyFiltersBtn.addEventListener('click', executeSearch);

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  nameInput.addEventListener('keypress', handleEnter);
  courseFilter.addEventListener('change', executeSearch);
  periodFilter.addEventListener('change', executeSearch);
  knowledgeSelect.addEventListener('change', executeSearch);
});

