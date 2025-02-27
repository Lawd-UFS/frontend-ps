import { HttpClient, HttpMethod } from '../infra/http/httpClient';

class AuthenticationService {
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

      localStorage.setItem('token', headers.authorization);

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

export const authenticationService = new AuthenticationService(
  HttpClient.create(),
);
