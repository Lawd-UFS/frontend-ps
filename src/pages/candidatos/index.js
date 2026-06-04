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
  const totalCountEl = document.querySelector('.candidates-total__count');

  // Render loading skeletons
  tbody.innerHTML = Array.from({ length: 5 }).map(() => `
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
      <td data-label="Ranking"><div class="skeleton-cell" style="width: 30%"></div></td>
      <td data-label="Ver mais"><div class="skeleton-cell skeleton-button"></div></td>
    </tr>
  `).join('');

  const candidates = await getAllCandidates();

  const updateTotalCount = (count) => {
    if (totalCountEl) {
      totalCountEl.textContent = count;
    }
  };

  if (!candidates || candidates.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="7" class="empty-state-cell">
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
    candidates.map(async (candidate) => {
      const tr = document.createElement('tr');

      const normalizedCourse = normalizeCourseName(candidate.course);
      tr.dataset.score = candidate.score || 0;
      tr.dataset.course = normalizedCourse.toLowerCase();
      tr.dataset.period = candidate.period ? candidate.period.toString() : '';

      if (candidate.status === 'eliminado') {
        tr.classList.add('row-eliminado');
      }

      const status = candidate.status;
      let badgeClass = '';
      let statusLabel = status.capitalize();
      
      if (status === 'eliminado') {
        badgeClass = 'status-badge--eliminado';
      } else if (status === 'concluido' || status === 'concluído') {
        badgeClass = 'status-badge--concluido';
      } else {
        badgeClass = 'status-badge--agendado';
      }

      tr.innerHTML = `<td data-label="Status"><span class="status-badge ${badgeClass}">${statusLabel}</span></td>`;

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

  const orderedCandidates = orderCandidates(loadedCandidates);

  setRanking(orderedCandidates);

  orderedCandidates.forEach((candidate) => {
    tbody.appendChild(candidate);
  });

  // Populate dynamic filters
  const courseFilter = document.querySelector('#filter-course');
  const periodFilter = document.querySelector('#filter-period');

  const uniqueCourses = [...new Set(candidates.map(c => normalizeCourseName(c.course)).filter(Boolean))].sort();
  const uniquePeriods = [...new Set(candidates.map(c => c.period ? c.period.toString() : '').filter(Boolean))].sort((a, b) => Number(a) - Number(b));

  uniqueCourses.forEach(course => {
    const opt = document.createElement('option');
    opt.value = course.toLowerCase();
    opt.innerText = course;
    courseFilter.appendChild(opt);
  });

  uniquePeriods.forEach(period => {
    const opt = document.createElement('option');
    opt.value = period;
    opt.innerText = `${period}º Período`;
    periodFilter.appendChild(opt);
  });

  // Filtros
  const filters = { scheduling: false, done: false, deleted: false };
  const filterButtons = {
    scheduling: document.querySelector('.scheduling_button'),
    done: document.querySelector('.done_button'),
    deleted: document.querySelector('.delete_button')
  };

  const applyFilters = () => {
    const selectedCourse = courseFilter.value;
    const selectedPeriod = periodFilter.value;

    let visibleCount = 0;

    orderedCandidates.forEach((tr) => {
      const statusText = tr.querySelector('td:nth-child(1)').innerText.toLowerCase();
      
      const isEliminado = statusText === 'eliminado';
      const scoreVal = Number(tr.dataset.score) || 0;
      const isDone = scoreVal > 0;
      const isScheduling = !isDone;

      // Status check
      const anyStatusFilterActive = filters.scheduling || filters.done || filters.deleted;
      let showByStatus = true;
      if (anyStatusFilterActive) {
        showByStatus = false;
        if (filters.scheduling && isScheduling && !isEliminado) showByStatus = true;
        if (filters.done && isDone && !isEliminado) showByStatus = true;
        if (filters.deleted && isEliminado) showByStatus = true;
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

      const show = showByStatus && showByCourse && showByPeriod;
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
          <td colspan="7" class="empty-state-cell">
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

  Object.keys(filterButtons).forEach(key => {
    const btn = filterButtons[key];
    if (btn) {
      btn.addEventListener('click', () => {
        filters[key] = !filters[key];
        btn.classList.toggle('active', filters[key]);
        applyFilters();
      });
    }
  });
});
