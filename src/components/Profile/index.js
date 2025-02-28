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
      <a href="${imgSrc}" target="_blank">
        <img src="${imgSrc}" alt="Foto de perfil" />
      </a>
      <span class="name-user">${name}</span>
    `;
  } catch (error) {
    profile.innerHTML = `
      <a href="${genericUserProfileImg}" target="_blank">
        <img src="${genericUserProfileImg}" alt="Foto de perfil" />
      </a>
      <span class="name-user">${name}</span>
    `;
  }

  return profile;
};
