export const Nav = (navLinks = [], className) => {
  const nav = document.createElement('nav');

  if (className) {
    nav.className = className;
  }

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
