import './styles.css';
import lovingDoodle from '../../../assets/images/loving-doodle.svg';
import celebration from '../../../assets/images/celebration.svg';
import discord from '../../../assets/images/discord.svg';
import mystery from '../../../assets/images/mystery.svg';

export const SubmissionSuccess = () => {
  const container = document.createElement('div');
  container.id = 'register-screen';

  const header = document.createElement('header');
  header.innerHTML = `
    <h1>Sua inscrição foi enviada!</h1>
  `;

  const section = document.createElement('section');
  section.innerHTML = `
    <div class="instructions-container">
      <img
        id="loving-doodle"
        src="data:image/svg+xml;utf8,${encodeURIComponent(lovingDoodle)}"
        alt="Ilustração de uma pessoa fazendo um coração roxo com as mãos"
      />
      <div class="register-text-container">
        <div class="register-text">
          <img
            src="data:image/svg+xml;utf8,${encodeURIComponent(celebration)}"
            alt="ícone de celebração"
          />

          Ficamos feliz por você querer fazer parte do nosso time :) Estamos
          torcendo por você!
        </div>
        <div class="register-text">
          <img src="data:image/svg+xml;utf8,${encodeURIComponent(mystery)}" alt="ícone de lupa" />
          Fique de olho nas próximas etapas. Acesse o link para agendar sua
          entrevista.
        </div>
      </div>
    </div>
    <div class="buttons-container">
      <button
        class="discord-button"
        onclick="location.href='https://discord.gg/JVSCNar6';"
      >
        <img
          src="data:image/svg+xml;utf8,${encodeURIComponent(discord)}"
          alt="ícone do aplicativo Discord"
        />

        Discord do PS
      </button>
      <button
        class="chatbot-button"
        onclick="location.href='https://t.me/LawdDcomp_bot';"
      >
        Agendamento de Entrevistas
      </button>
    </div>
  `;

  container.appendChild(header);
  container.appendChild(section);

  return container;
};
