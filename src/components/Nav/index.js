import './nav.css';

export const Nav = (navLinks = []) => {
  const nav = document.createElement('nav');

  const ul = document.createElement('ul');

  navLinks.forEach((link) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.name;

    li.appendChild(a);
    ul.appendChild(li);
  });

  nav.appendChild(ul);

  return nav;
};
