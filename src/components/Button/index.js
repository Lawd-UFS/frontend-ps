import './button.css';

export const Button = (text, variant = 'primary') => {
  const button = document.createElement('button');
  button.setAttribute('class', variant);
  button.textContent = text;

  return button;
};
