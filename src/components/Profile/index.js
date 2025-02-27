import './styles.css';
import genericUserProfileImg from '../../assets/images/icon-user.png';

export const Profile = ({ name, imgSrc }) => {
  const profile = document.createElement('div');
  profile.setAttribute('class', 'profile');

  const imgElement = new Image();
  imgElement.src = imgSrc;

  imgElement.onload = () => {
    profile.innerHTML = `
    <img src="${imgSrc}" alt="Foto de perfil" />
    <span class="name-user">${name}</span>
  `;
  };

  imgElement.onerror = () => {
    profile.innerHTML = `
    <img src="${genericUserProfileImg}" alt="Foto de perfil" />
    <span class="name-user">${name}</span>
  `;
  };

  return profile;
};
