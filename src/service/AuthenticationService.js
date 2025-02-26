import { HttpMethod } from '../infra/http/httpClient';

export class AuthenticationService {
  constructor(httpClient) {
    if (!httpClient) {
      throw new Error(
        'É preciso passar uma instância da classe HttpClient no construtor',
      );
    }

    this._httpClient = httpClient;
  }

  async authenticate(email, password) {
    try {
      const { headers, data: response } = await this._httpClient.sendRequest({
        endpoint: '/login',
        method: HttpMethod.POST,
        body: {
          email,
          password,
        },
      });

      response.token = headers.authorization;

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
