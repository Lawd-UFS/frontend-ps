import './styles.css';

export const CandidateInfo = (candidate) => {
  const candidateCard = document.createElement('div');
  candidateCard.setAttribute('id', 'candidate-details');

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  candidateCard.innerHTML = `
    <h2>Informações do Candidato</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">Nome:</span>
        <span class="value">${candidate.name}</span>
      </div>
      <div class="info-item">
        <span class="label">Data de Nascimento:</span>
        <span class="value">${formatDate(candidate.birthDate)} (${getAge(candidate.birthDate)} anos)</span>
      </div>
      <div class="info-item">
        <span class="label">Curso:</span>
        <span class="value">${candidate.course}</span>
      </div>
      <div class="info-item">
        <span class="label">Período:</span>
        <span class="value">${candidate.period}º</span>
      </div>
      <div class="info-item">
        <span class="label">Pronome:</span>
        <span class="value">${candidate.pronoun}</span>
      </div>
      <div class="info-item">
        <span class="label">Gênero:</span>
        <span class="value">${candidate.gender}</span>
      </div>
      <div class="info-item full-width">
        <span class="label">Motivação:</span>
        <span class="value">${candidate.motivation}</span>
      </div>
      <div class="info-item full-width">
        <span class="label">Habilidades:</span>
        <span class="value">${candidate.skills}</span>
      </div>
      <div class="info-item">
        <span class="label">Nível de Conhecimento:</span>
        <span class="value">${candidate.knowledgeLevel}</span>
      </div>
      <div class="info-item full-width">
        <span class="label">Interesses:</span>
        <span class="value">${candidate.interests}</span>
      </div>
    </div>
  `;

  if (candidate.portfolioExternalLink) {
    candidateCard.querySelector('.info-grid').innerHTML += `
      <div class="info-item">
        <span class="label">Portfólio:</span>
        <a href="${candidate.portfolioExternalLink}" target="_blank" class="portfolio-link">Ver portfólio</a>
      </div>
    `;
  }

  if (candidate.portfolioFileUrl) {
    candidateCard.querySelector('.info-grid').innerHTML += `
      <div class="info-item">
        <span class="label">Portfólio:</span>
        <a href="${candidate.portfolioFileUrl}" target="_blank" class="portfolio-link">Ver portfólio</a>
      </div>
    `;
  }

  return candidateCard;
};
