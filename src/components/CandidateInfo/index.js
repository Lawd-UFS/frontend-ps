import './styles.css';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const getAge = (birthDate) => {
  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

const formatPhone = (phone) => {
  if (!phone) return '-';
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

const renderTags = (text) => {
  if (!text) return '<span class="candidate-field__value">-</span>';

  const tags = text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (tags.length === 0) {
    return '<span class="candidate-field__value">-</span>';
  }

  return `<div class="candidate-tags">${tags.map((tag) => `<span class="candidate-tag">${tag}</span>`).join('')}</div>`;
};

const renderField = (label, value, options = {}) => {
  const { fullWidth = false, href = null } = options;
  const className = fullWidth ? 'candidate-field candidate-field--full' : 'candidate-field';

  const valueHtml = href
    ? `<a href="${href}" target="_blank" rel="noopener noreferrer" class="portfolio-link">${value}</a>`
    : `<span class="candidate-field__value">${value || '-'}</span>`;

  return `
    <div class="${className}">
      <span class="candidate-field__label">${label}</span>
      ${valueHtml}
    </div>
  `;
};

export const CandidateInfo = (candidate) => {
  const candidateCard = document.createElement('article');
  candidateCard.setAttribute('id', 'candidate-details');

  const age = candidate.birthDate ? getAge(candidate.birthDate) : null;
  const birthText = candidate.birthDate
    ? `${formatDate(candidate.birthDate)}${age !== null ? ` (${age} anos)` : ''}`
    : '-';

  const portfolioLink = candidate.portfolioExternalLink || candidate.portfolioFileUrl;

  candidateCard.innerHTML = `
    <header class="candidate-card__header">
      <div class="candidate-card__avatar" aria-hidden="true">${getInitials(candidate.name)}</div>
      <div class="candidate-card__intro">
        <h2 class="candidate-card__name">${candidate.name || '-'}</h2>
        <div class="candidate-card__badges">
          ${candidate.course ? `<span class="candidate-badge">${candidate.course}</span>` : ''}
          ${candidate.period ? `<span class="candidate-badge">${candidate.period}º período</span>` : ''}
          ${candidate.knowledgeLevel ? `<span class="candidate-badge candidate-badge--accent">${candidate.knowledgeLevel}</span>` : ''}
        </div>
      </div>
    </header>

    <div class="candidate-card__body">
      <section class="candidate-card__section">
        <h3 class="candidate-card__section-title">Dados pessoais</h3>
        <div class="candidate-card__grid">
          ${renderField('Nascimento', birthText)}
          ${renderField('Pronome', candidate.pronoun)}
          ${renderField('Gênero', candidate.gender)}
        </div>
      </section>

      <section class="candidate-card__section">
        <h3 class="candidate-card__section-title">Contato</h3>
        <div class="candidate-card__grid">
          ${renderField('Telefone', formatPhone(candidate.phone))}
          ${renderField('Email', candidate.email, { fullWidth: true })}
        </div>
      </section>

      <section class="candidate-card__expandable">
        <div class="candidate-card__panel">
          <h3 class="candidate-card__section-title">Habilidades</h3>
          ${renderTags(candidate.skills)}
        </div>
        <div class="candidate-card__panel">
          <h3 class="candidate-card__section-title">Motivação</h3>
          <p class="candidate-panel__text">${candidate.motivation || '-'}</p>
        </div>
        <div class="candidate-card__panel">
          <h3 class="candidate-card__section-title">Interesses</h3>
          <p class="candidate-panel__text">${candidate.interests || '-'}</p>
        </div>
      </section>

      ${
        portfolioLink
          ? `<section class="candidate-card__section candidate-card__section--portfolio">
              ${renderField('Portfólio', 'Ver portfólio', { href: portfolioLink })}
            </section>`
          : ''
      }
    </div>
  `;

  return candidateCard;
};
