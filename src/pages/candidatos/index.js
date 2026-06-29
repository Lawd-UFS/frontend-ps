import { authenticationService } from '../../service/AuthenticationService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import './index.css';
import { Header } from '../../components/Header';
import { HttpClient, HttpMethod } from '../../infra/http/httpClient';
import { Profile } from '../../components/Profile';
import { getApprovedDynamicOrder } from '../../constants/approvedDynamicNames';

const httpClient = HttpClient.create();

const normalizeCourseName = (course) => {
  if (!course) return '';
  const normalized = course
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    normalized === 'cc' ||
    normalized.includes('ciencia da computacao') ||
    normalized.includes('ciencias da computacao') ||
    normalized.includes('ciencia computacao') ||
    normalized.includes('ciencias computacao')
  ) {
    return 'Ciência da Computação';
  }
  if (
    normalized === 'si' ||
    normalized.includes('sistemas de informacao') ||
    normalized.includes('sistema de informacao') ||
    normalized.includes('sistemas informacao') ||
    normalized.includes('sistema informacao')
  ) {
    return 'Sistemas de Informação';
  }
  if (
    normalized === 'ec' ||
    normalized.includes('engenharia da computacao') ||
    normalized.includes('engenharia de computacao') ||
    normalized.includes('engenharia computacao')
  ) {
    return 'Engenharia da Computação';
  }

  const wordCorrections = {
    ciencia: 'Ciência',
    ciencias: 'Ciências',
    computacao: 'Computação',
    sistema: 'Sistema',
    sistemas: 'Sistemas',
    informacao: 'Informação',
    informacoes: 'Informações',
    engenharia: 'Engenharia',
    estatistica: 'Estatística',
    matematica: 'Matemática',
    fisica: 'Física',
    quimica: 'Química',
    administracao: 'Administração',
    mecanica: 'Mecânica',
    eletrica: 'Elétrica',
    producao: 'Produção',
    civil: 'Civil',
    de: 'de',
    da: 'da',
    do: 'do',
    dos: 'dos',
    das: 'das',
    e: 'e',
  };

  const words = normalized.split(/\s+/);
  return words
    .map((word) => {
      if (wordCorrections[word]) {
        return wordCorrections[word];
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

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

const INTERVIEWED_STATUSES = new Set([
  'reprovado_entrevista',
  'aprovado_entrevista',
  'aprovado_ps',
  'reprovado_ps',
]);

const isInterviewed = (candidateRow) =>
  INTERVIEWED_STATUSES.has(candidateRow.dataset.status) ||
  Number(candidateRow.dataset.score) > 0;

const formatNota = (score) => {
  const num = Number(score);
  if (!num || num <= 0) return '-';
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
};

const getNotaDisplay = (candidate) => {
  const status = candidate.status || 'inscrito';
  const score = candidate.score || 0;

  if (!INTERVIEWED_STATUSES.has(status) && Number(score) <= 0) {
    return '-';
  }

  return formatNota(score);
};

const isDynamicApprovedRow = (row) => row.dataset.dynamicOrder !== undefined;

const compareDynamicOrder = (a, b) => {
  const inA = isDynamicApprovedRow(a);
  const inB = isDynamicApprovedRow(b);

  if (inA && inB) {
    return Number(a.dataset.dynamicOrder) - Number(b.dataset.dynamicOrder);
  }
  if (inA && !inB) return -1;
  if (!inA && inB) return 1;
  return 0;
};

const sortByScore = (a, b) => {
  const interviewedA = isInterviewed(a);
  const interviewedB = isInterviewed(b);

  if (interviewedA && !interviewedB) return -1;
  if (!interviewedA && interviewedB) return 1;

  const scoreA = Number(a.dataset.score) || 0;
  const scoreB = Number(b.dataset.score) || 0;
  if (scoreB !== scoreA) return scoreB - scoreA;

  const idxA = Number(a.dataset.index) || 0;
  const idxB = Number(b.dataset.index) || 0;
  return idxB - idxA;
};

const setRanking = (candidates) => {
  candidates.forEach((candidate) => {
    candidate.querySelector('.ranking').innerText = '-';
  });

  const rankedCandidates = candidates
    .filter((candidate) => {
      const status = candidate.dataset.status;
      return status === 'aprovado_entrevista' || status === 'aprovado_ps';
    })
    .sort((a, b) => Number(b.dataset.score) - Number(a.dataset.score));

  let currentRank = 1;
  let previousScore = null;
  let previousRanking = null;

  rankedCandidates.forEach((candidate) => {
    const score = Number(candidate.dataset.score) || 0;

    if (previousScore !== null && score === previousScore) {
      candidate.querySelector('.ranking').innerText = previousRanking;
    } else {
      candidate.querySelector('.ranking').innerText = currentRank;
      previousRanking = currentRank;
    }

    previousScore = score;
    currentRank++;
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const header = await Header();

  document.body.prepend(header);

  const tbody = document.querySelector('tbody');
  const totalCountEl = document.querySelector('.candidates-total__count');

  // Render loading skeletons
  tbody.innerHTML = Array.from({ length: 5 })
    .map(
      () => `
    <tr class="skeleton-row">
      <td data-label="Status"><div class="skeleton-cell skeleton-badge"></div></td>
      <td data-label="Candidato">
        <div class="skeleton-profile">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-text"></div>
        </div>
      </td>
      <td data-label="Telefone"><div class="skeleton-cell" style="width: 80%"></div></td>
      <td data-label="Curso"><div class="skeleton-cell" style="width: 90%"></div></td>
      <td data-label="Período"><div class="skeleton-cell" style="width: 40%"></div></td>
      <td data-label="Nota"><div class="skeleton-cell" style="width: 30%"></div></td>
      <td data-label="Ranking" class="ranking"><div class="skeleton-cell" style="width: 30%"></div></td>
      <td data-label="Ver mais"><div class="skeleton-cell skeleton-button"></div></td>
    </tr>
  `,
    )
    .join('');

  const candidates = await getAllCandidates();

  const updateTotalCount = (count) => {
    if (totalCountEl) {
      totalCountEl.textContent = count;
    }
  };

  if (!candidates || candidates.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="8" class="empty-state-cell">
          <div class="empty-state-content">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <p class="empty-message">Não há candidatos cadastrados no momento.</p>
          </div>
        </td>
      </tr>
    `;
    updateTotalCount(0);
    return;
  }

  tbody.innerHTML = '';
  updateTotalCount(candidates.length);
  const loadedCandidates = await Promise.all(
    candidates.map(async (candidate, index) => {
      const tr = document.createElement('tr');

      const normalizedCourse = normalizeCourseName(candidate.course);
      tr.dataset.score = candidate.score || 0;
      tr.dataset.course = normalizedCourse.toLowerCase();
      tr.dataset.period = candidate.period ? candidate.period.toString() : '';
      tr.dataset.index = index;
      tr.dataset.name = candidate.name ? candidate.name.toLowerCase() : '';
      tr.dataset.isScheduled = candidate.isScheduled === true ? 'true' : 'false';

      const dynamicOrder = getApprovedDynamicOrder(candidate.name);
      const isDynamicApproved = dynamicOrder !== -1;

      if (
        !isDynamicApproved &&
        (candidate.status === 'reprovado_curriculo' ||
          candidate.status === 'reprovado_entrevista' ||
          candidate.status === 'reprovado_ps' ||
          candidate.status === 'eliminado')
      ) {
        tr.classList.add('row-eliminado');
      }

      const status = candidate.status || 'inscrito';
      tr.dataset.status = status;

      if (isDynamicApproved) {
        tr.dataset.dynamicOrder = dynamicOrder;
        tr.classList.add('row-aprovado-dinamica');
      }

      const statusConfig = {
        inscrito: { label: 'Inscrito', badgeClass: 'status-badge--inscrito' },
        aprovado_curriculo: {
          label: 'Aprov. Currículo',
          badgeClass: 'status-badge--aprovado',
        },
        reprovado_curriculo: {
          label: 'Reprov. Currículo',
          badgeClass: 'status-badge--reprovado',
        },
        aprovado_entrevista: {
          label: 'Aprov. Entrevista',
          badgeClass: 'status-badge--aprovado',
        },
        reprovado_entrevista: {
          label: 'Reprov. Entrevista',
          badgeClass: 'status-badge--reprovado',
        },
        aprovado_ps: {
          label: 'Aprovado no PS',
          badgeClass: 'status-badge--aprovado-ps',
        },
        reprovado_ps: {
          label: 'Reprovado no PS',
          badgeClass: 'status-badge--reprovado',
        },
        // Fallback para dados legados
        ativo: { label: 'Ativo', badgeClass: 'status-badge--agendado' },
        eliminado: {
          label: 'Eliminado',
          badgeClass: 'status-badge--reprovado',
        },
      };

      const config = isDynamicApproved
          ? {
              label: 'Aprov./Dinâmica',
              badgeClass: 'status-badge--aprovado-dinamica',
            }
          : statusConfig[status] || {
              label: status,
              badgeClass: 'status-badge--inscrito',
            };

      const statusMarkup = isDynamicApproved
        ? `<span class="status-badge ${config.badgeClass}">Aprov./Dinâmica<span class="dinamica-star" aria-hidden="true">★</span></span>`
        : `<span class="status-badge ${config.badgeClass}">${config.label}</span>`;

      tr.innerHTML = `<td data-label="Status">${statusMarkup}</td>`;

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

      const phoneText = candidate.phone
        ? candidate.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        : '-';
      tr.innerHTML += `
      <td data-label="Telefone">${phoneText}</td>
      <td data-label="Curso">${normalizedCourse || '-'}</td>
      <td data-label="Período">${candidate.period ? `${candidate.period}º` : '-'}</td>
      <td data-label="Nota" class="nota">${getNotaDisplay(candidate)}</td>
      <td data-label="Ranking" class="ranking">-</td>
      <td data-label="Ver mais" class="actions-cell">
        <button type="button" class="view-profile-btn" title="Ver perfil completo">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <span class="view-profile-btn__label">Ver mais</span>
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

  const orderedCandidates = [...loadedCandidates];
  setRanking(orderedCandidates);
  const sortOrderSelect = document.querySelector('#sort-order');

  const renderSortedCandidates = () => {
    const sortOrder = sortOrderSelect ? sortOrderSelect.value : 'score';

    orderedCandidates.sort((a, b) => {
      const dynamicCmp = compareDynamicOrder(a, b);
      if (dynamicCmp !== 0) return dynamicCmp;

      if (sortOrder === 'score') {
        return sortByScore(a, b);
      }

      const idxA = Number(a.dataset.index) || 0;
      const idxB = Number(b.dataset.index) || 0;
      return sortOrder === 'last' ? idxB - idxA : idxA - idxB;
    });

    tbody.innerHTML = '';
    orderedCandidates.forEach((candidate) => {
      tbody.appendChild(candidate);
    });
  };

  renderSortedCandidates();

  if (sortOrderSelect) {
    sortOrderSelect.addEventListener('change', () => {
      renderSortedCandidates();
      applyFilters();
    });
  }

  // Populate dynamic filters
  const courseFilter = document.querySelector('#filter-course');
  const periodFilter = document.querySelector('#filter-period');
  const searchInput = document.querySelector('#search-candidate');

  const uniqueCourses = [
    ...new Set(
      candidates.map((c) => normalizeCourseName(c.course)).filter(Boolean),
    ),
  ].sort();
  const uniquePeriods = [
    ...new Set(
      candidates
        .map((c) => (c.period ? c.period.toString() : ''))
        .filter(Boolean),
    ),
  ].sort((a, b) => Number(a) - Number(b));

  uniqueCourses.forEach((course) => {
    const opt = document.createElement('option');
    opt.value = course.toLowerCase();
    opt.innerText = course;
    courseFilter.appendChild(opt);
  });

  uniquePeriods.forEach((period) => {
    const opt = document.createElement('option');
    opt.value = period;
    opt.innerText = `${period}º Período`;
    periodFilter.appendChild(opt);
  });

  // Filtros
  const filters = { scheduling: false, scheduled: false, done: false, deleted: false };
  const filterButtons = {
    scheduling: document.querySelector('.scheduling_button'),
    scheduled: document.querySelector('.scheduled_interviews_button'),
    done: document.querySelector('.done_button'),
    deleted: document.querySelector('.delete_button'),
  };

  const applyFilters = () => {
    const selectedCourse = courseFilter.value;
    const selectedPeriod = periodFilter.value;
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';

    let visibleCount = 0;

    orderedCandidates.forEach((tr) => {
      const statusText = tr
        .querySelector('td:nth-child(1)')
        .innerText.toLowerCase();

      const isReprovado =
        statusText.includes('reprov') || statusText === 'eliminado';
      const isAprovado =
        (statusText.includes('aprov') && !statusText.includes('currículo')) ||
        statusText === 'concluído';
      const isInscrito =
        statusText === 'inscrito' ||
        statusText === 'ativo' ||
        (statusText.includes('currículo') && !statusText.includes('reprov'));
      const isScheduled = tr.dataset.isScheduled === 'true';

      // Status check
      const anyStatusFilterActive =
        filters.scheduling || filters.scheduled || filters.done || filters.deleted;
      let showByStatus = true;
      if (anyStatusFilterActive) {
        showByStatus = false;
        if (filters.scheduling && isInscrito) showByStatus = true;
        if (filters.scheduled && isScheduled) showByStatus = true;
        if (filters.done && isAprovado) showByStatus = true;
        if (filters.deleted && isReprovado) showByStatus = true;
      }

      // Course check
      let showByCourse = true;
      if (selectedCourse) {
        showByCourse = tr.dataset.course === selectedCourse;
      }

      // Period check
      let showByPeriod = true;
      if (selectedPeriod) {
        showByPeriod = tr.dataset.period === selectedPeriod;
      }

      // Name search check
      let showBySearch = true;
      if (searchValue) {
        const candidateName = tr.dataset.name || '';
        showBySearch = candidateName.includes(searchValue);
      }

      const show = showByStatus && showByCourse && showByPeriod && showBySearch;
      tr.style.display = show ? '' : 'none';

      if (show) {
        visibleCount++;
      }
    });

    updateTotalCount(visibleCount);

    // Toggle empty state row
    let emptyRow = tbody.querySelector('.empty-state-row');
    if (visibleCount === 0) {
      if (!emptyRow) {
        emptyRow = document.createElement('tr');
        emptyRow.className = 'empty-state-row';
        emptyRow.innerHTML = `
          <td colspan="8" class="empty-state-cell">
            <div class="empty-state-content">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <p class="empty-message">Nenhum candidato corresponde aos filtros selecionados.</p>
            </div>
          </td>
        `;
        tbody.appendChild(emptyRow);
      } else {
        emptyRow.style.display = '';
      }
    } else {
      if (emptyRow) {
        emptyRow.style.display = 'none';
      }
    }
  };

  courseFilter.addEventListener('change', applyFilters);
  periodFilter.addEventListener('change', applyFilters);
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  Object.entries(filterButtons).forEach(([key, btn]) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      filters[key] = !filters[key];
      if (filters[key]) {
        btn.classList.add('active');
        btn.style.backgroundColor = 'var(--purple-300, #7046E9)';
        btn.querySelector('span').style.color = '#FFFFFF';
      } else {
        btn.classList.remove('active');
        btn.style.backgroundColor = '';
        btn.querySelector('span').style.color = '';
      }
      applyFilters();
    });
  });
});
