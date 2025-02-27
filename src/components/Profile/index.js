import './styles.css';
import genericUserProfileImg from '../../assets/images/icon-user.png';

export const Profile = ({ name, imgSrc }) => {
  const img = imgSrc ?? genericUserProfileImg;

  const profile = document.createElement('div');

  profile.setAttribute('class', 'profile');

  profile.innerHTML = `
    <img src="${img}" alt="Foto de perfil" />
    <span class="name-user">${name}</span>
  `;

  return profile;
};
