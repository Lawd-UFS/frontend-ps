import './styles.css';

export const Badge = (text) => {
  const badge = document.createElement('span');

  badge.classList.add('badge');
  badge.textContent = text;

  return badge;
};
