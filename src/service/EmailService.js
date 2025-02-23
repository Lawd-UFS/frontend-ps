import { HttpMethod } from '../infra/http/httpClient';

export class EmailService {
  constructor(httpClient) {
    if (!httpClient) {
      throw new Error(
        'É preciso passar uma instância da classe HttpClient no construtor',
      );
    }

    this._httpClient = httpClient;
  }

  async confirmEmail(token) {
    if (!token) {
      return {
        success: false,
        message: 'Token não informado',
      };
    }

    try {
      const response = await this._httpClient.sendRequest({
        endpoint: `/verificar-email?token=${token}`,
        method: HttpMethod.POST,
      });

      return response.success;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
