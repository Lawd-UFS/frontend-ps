import { authenticationService } from '../../../service/AuthenticationService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import './index.css';
import { Header } from '../../../components/Header';
import { HttpClient, HttpMethod } from '../../../infra/http/httpClient';

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

// Helper to get Candidate ID from URL (e.g. /candidatos/6a1d78ac8fe8a5510262abc3)
const getCandidateId = () => {
  const url = window.location.pathname;
  return url.split('/').pop();
};

const getCandidateDetails = async (id) => {
  try {
    const { data: response } = await httpClient.sendRequest({
      endpoint: `/candidatos/${id}`,
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
      return null;
    }
    console.error(error);
    return null;
  }
};

const getAge = (birthDateString) => {
  if (!birthDateString) return null;
  const birth = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatPhone = (phoneString) => {
  if (!phoneString) return '-';
  return phoneString.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const STATUS_CONFIG = {
  inscrito: { label: 'Inscrito', cssClass: 'status-inscrito' },
  aprovado_curriculo: {
    label: 'Aprovado na Análise de Currículo',
    cssClass: 'status-aprovado',
  },
  reprovado_curriculo: {
    label: 'Reprovado na Análise de Currículo',
    cssClass: 'status-reprovado',
  },
  aprovado_entrevista: {
    label: 'Aprovado na Entrevista',
    cssClass: 'status-aprovado',
  },
  reprovado_entrevista: {
    label: 'Reprovado na Entrevista',
    cssClass: 'status-reprovado',
  },
  aprovado_ps: {
    label: 'Aprovado no Processo Seletivo',
    cssClass: 'status-aprovado-ps',
  },
  reprovado_ps: {
    label: 'Reprovado no Processo Seletivo',
    cssClass: 'status-reprovado',
  },
  // Fallback legado
  ativo: { label: 'Ativo', cssClass: 'status-active' },
  eliminado: { label: 'Eliminado', cssClass: 'status-eliminated' },
};

const ALLOWED_TRANSITIONS = {
  inscrito: ['aprovado_curriculo', 'reprovado_curriculo'],
  aprovado_curriculo: ['inscrito', 'aprovado_entrevista', 'reprovado_entrevista'],
  reprovado_curriculo: ['inscrito'],
  aprovado_entrevista: ['aprovado_curriculo', 'aprovado_ps', 'reprovado_ps'],
  reprovado_entrevista: ['aprovado_curriculo'],
  aprovado_ps: ['aprovado_entrevista'],
  reprovado_ps: ['aprovado_entrevista'],
  // Legado
  ativo: ['aprovado_curriculo', 'reprovado_curriculo'],
  eliminado: ['inscrito'],
};

const handleStatusChange = async (candidateId, newStatus, selectEl) => {
  const config = STATUS_CONFIG[newStatus];
  const confirmMsg = `Tem certeza que deseja alterar o status para "${config?.label || newStatus}"?`;

  if (!confirm(confirmMsg)) {
    // Restaurar valor anterior
    selectEl.value = selectEl.dataset.currentStatus;
    return;
  }

  try {
    await httpClient.sendRequest({
      endpoint: `/candidatos/${candidateId}/status`,
      method: HttpMethod.PATCH,
      headers: {
        Authorization: authenticationService.getToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    selectEl.dataset.currentStatus = newStatus;

    // Atualizar pill visual
    const pill = document.querySelector('.status-pill');
    if (pill) {
      pill.className = 'status-pill ' + (config?.cssClass || 'status-active');
      pill.textContent = config?.label || newStatus.toUpperCase();
    }

    // Feedback visual
    const toast = document.createElement('div');
    toast.className = 'status-toast status-toast--success';
    toast.textContent = 'Status atualizado com sucesso!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  } catch (error) {
    selectEl.value = selectEl.dataset.currentStatus;
    const errorMsg =
      error?.data?.message || 'Erro ao atualizar status. Tente novamente.';
    const toast = document.createElement('div');
    toast.className = 'status-toast status-toast--error';
    toast.textContent = errorMsg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
};

const renderProfile = (candidate) => {
  const container = document.getElementById('profile-content');
  container.className = 'profile-content-loaded';

  const initials = getInitials(candidate.name);
  const age = getAge(candidate.birthDate);
  const formattedBirthDate = formatDate(candidate.birthDate);
  const formattedPhone = formatPhone(candidate.phone);

  // Split skills into an array for beautiful rendering
  const skillsList = candidate.skills
    ? candidate.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const currentStatus = candidate.status || 'inscrito';
  const statusInfo = STATUS_CONFIG[currentStatus] || {
    label: currentStatus.toUpperCase(),
    cssClass: 'status-active',
  };

  const allowedTransitions = ALLOWED_TRANSITIONS[currentStatus] || [];
  const hasTransitions = allowedTransitions.length > 0;

  const normalizedCourse = normalizeCourseName(candidate.course);

  // Build status dropdown options
  let statusSelectHtml = '';
  if (hasTransitions) {
    const options = allowedTransitions
      .map((s) => {
        const cfg = STATUS_CONFIG[s];
        return `<option value="${s}">${cfg?.label || s}</option>`;
      })
      .join('');

    statusSelectHtml = `
      <div class="status-change-container">
        <label class="status-change-label">Alterar status:</label>
        <select id="status-select" class="status-change-select" data-current-status="${currentStatus}">
          <option value="" disabled selected>Selecionar novo status...</option>
          ${options}
        </select>
      </div>
    `;
  }

  // Build profile structure
  container.innerHTML = `
    <div class="profile-header-card">
      <div class="profile-avatar-row">
        <div class="profile-avatar-large">
          ${candidate.profilePhotoUrl ? `<img src="${candidate.profilePhotoUrl}" alt="${candidate.name}" />` : initials}
        </div>
        <div class="profile-title-info">
          <div class="name-status-row">
            <h1>${candidate.name}</h1>
            <span class="status-pill ${statusInfo.cssClass}">${statusInfo.label}</span>
          </div>
          <p class="subtitle-text">${normalizedCourse || '-'} • ${candidate.period ? `${candidate.period}º Período` : '-'}</p>
          <div class="score-indicator">
            <span class="score-label">Pontuação do Processo Seletivo:</span>
            <span class="score-value">${candidate.score || 0}</span>
          </div>
          ${statusSelectHtml}
        </div>
      </div>
    </div>

    <div class="profile-details-grid">
      <!-- Left side: Personal & contact info -->
      <div class="details-panel-card">
        <h2>Dados do Candidato</h2>
        
        <div class="info-group">
          <label>Email</label>
          <span class="info-val">${candidate.email || '-'}</span>
        </div>

        <div class="info-group">
          <label>Telefone</label>
          <span class="info-val">${formattedPhone}</span>
        </div>

        <div class="info-group-row">
          <div class="info-group">
            <label>Pronomes</label>
            <span class="info-val">${candidate.pronoun || '-'}</span>
          </div>
          <div class="info-group">
            <label>Gênero</label>
            <span class="info-val">${candidate.gender || '-'}</span>
          </div>
        </div>

        <div class="info-group">
          <label>Data de Nascimento</label>
          <span class="info-val">${formattedBirthDate} ${age ? `(${age} anos)` : ''}</span>
        </div>

        <div class="info-group">
          <label>Nível de Conhecimento</label>
          <span class="info-val highlight-badge">${candidate.knowledgeLevel || 'Iniciante'}</span>
        </div>
      </div>

      <!-- Right side: Motivations, interests, skills -->
      <div class="details-panel-card space-between-col">
        <div class="info-section">
          <h2>Motivação & Habilidades</h2>
          
          <div class="info-group block-text">
            <label>Motivação para entrar na LAWD</label>
            <p class="narrative-text">${candidate.motivation || 'Nenhuma motivação informada.'}</p>
          </div>

          <div class="info-group block-text">
            <label>Principais Habilidades</label>
            <div class="skills-tags-container">
              ${
                skillsList.length > 0
                  ? skillsList
                      .map((skill) => `<span class="skill-tag">${skill}</span>`)
                      .join('')
                  : '<span class="no-skills">Nenhuma habilidade cadastrada</span>'
              }
            </div>
          </div>

          <div class="info-group block-text">
            <label>Áreas de Interesse</label>
            <p class="narrative-text">${candidate.interests || 'Nenhum interesse informado.'}</p>
          </div>
        </div>

        <!-- Links and integrations -->
        <div class="social-links-footer">
          <div class="links-title">Conecte-se:</div>
          <div class="links-buttons-row">
            ${
              candidate.github
                ? `<a href="${candidate.github.startsWith('http') ? candidate.github : `https://github.com/${candidate.github}`}" target="_blank" class="social-btn github-btn">
                  <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
                  GitHub
                 </a>`
                : ''
            }
            ${
              candidate.linkedin
                ? `<a href="${candidate.linkedin.startsWith('http') ? candidate.linkedin : `https://www.linkedin.com/in/${candidate.linkedin}`}" target="_blank" class="social-btn linkedin-btn">
                  <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  LinkedIn
                 </a>`
                : ''
            }
            ${
              candidate.portfolioExternalLink
                ? `<a href="${candidate.portfolioExternalLink}" target="_blank" class="social-btn portfolio-btn">
                  <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.09.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.11-.9-2-2-2h-8l-2-2z"/></svg>
                  Portfólio
                 </a>`
                : ''
            }
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach status change handler
  const statusSelect = document.getElementById('status-select');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      handleStatusChange(candidate.id || candidate._id, e.target.value, statusSelect);
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const header = await Header();
  document.body.prepend(header);

  const candidateId = getCandidateId();
  if (!candidateId) {
    document.getElementById('profile-content').innerHTML = `
      <div class="error-state">
        <p>ID do candidato inválido.</p>
        <a href="/candidatos" class="btn-primary">Voltar para a Lista</a>
      </div>
    `;
    return;
  }

  const candidate = await getCandidateDetails(candidateId);
  if (!candidate) {
    document.getElementById('profile-content').innerHTML = `
      <div class="error-state">
        <p>Não foi possível encontrar as informações deste candidato.</p>
        <a href="/candidatos" class="btn-primary">Voltar para a Lista</a>
      </div>
    `;
    return;
  }

  renderProfile(candidate);
});
