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
      localStorage.setItem('user', JSON.stringify(response.data));

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
    window.location.href = '/';
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUserData() {
    if (!localStorage.getItem('user')) this.logout();

    return JSON.parse(localStorage.getItem('user'));
  }
}

export const authenticationService = new AuthenticationService(
  HttpClient.create(),
);
