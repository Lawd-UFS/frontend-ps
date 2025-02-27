import './styles.css';
import genericUserProfileImg from '../../assets/images/icon-user.png';

export const Profile = async ({ name, imgSrc }, elementType = 'div') => {
  const profile = document.createElement(elementType);
  profile.setAttribute('class', 'profile');

  try {
    const response = await fetch(imgSrc);

    if (!response.ok) {
      throw new Error('Imagem não encontrada');
    }

    profile.innerHTML = `
      <img src="${imgSrc}" alt="Foto de perfil" />
      <span class="name-user">${name}</span>
    `;
  } catch (error) {
    profile.innerHTML = `
      <img src="${genericUserProfileImg}" alt="Foto de perfil" />
      <span class="name-user">${name}</span>
  `;
  }

  return profile;
};
