import './styles.css';

export const Profile = ({ name, imgSrc }) => {
  const profile = document.createElement('div');

  profile.setAttribute('class', 'profile');

  profile.innerHTML = `
    <img src="${imgSrc}" alt="Foto de perfil" />
    <span class="name-user">${name}</span>
  `;

  return profile;
};
