import EnrollmentSubmission from '../../components/EnrollmentSubmission';
import { HttpClient } from '../../infra/http/httpClient';
import { EmailService } from '../../service/EmailService';
import './index.css';

const main = document.querySelector('main');

const emailService = new EmailService(HttpClient.create());

const getUrlToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
};

document.addEventListener('DOMContentLoaded', async () => {
  const token = getUrlToken();

  if (!token) {
    main.appendChild(EnrollmentSubmission.Error({ hasToken: false }));
    return;
  }

  const result = await emailService.confirmEmail(token);

  if (result.success) {
    main.appendChild(EnrollmentSubmission.Success());
    return;
  }

  if (result.message === 'Token inválido ou expirado.') {
    main.appendChild(
      EnrollmentSubmission.Error({
        hasToken: true,
        resendEmail: emailService.resendEmail,
        message:
          'Parece que a sua confirmação expirou. Deseja reenviar o email?',
      }),
    );
    return;
  }

  main.appendChild(EnrollmentSubmission.Error({ hasToken: true }));
});
