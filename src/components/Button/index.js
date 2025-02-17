import './styles.css';

export const Button = (text, variant = 'primary') => {
  const button = document.createElement('button');
  button.classList.add('button');
  button.classList.add(variant);

  button.textContent = text;

  return button;
};
