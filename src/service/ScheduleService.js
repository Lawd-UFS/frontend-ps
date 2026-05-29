import { HttpMethod } from '../infra/http/httpClient';
import { authenticationService } from './AuthenticationService';

export class ScheduleService {
  constructor(httpClient, token) {
    if (!httpClient || !token) {
      return null;
    }

    this._httpClient = httpClient;
    this._token = token;
  }

  async getEvaluatorSchedules() {
    try {
      const { data: schedules } = await this._httpClient.sendRequest({
        endpoint: '/horarios',
        method: HttpMethod.GET,
        headers: {
          Authorization: this._token,
        },
      });

      return schedules;
    } catch (error) {
      if (error.status === 401) {
        alert('Sessão expirada, faça login novamente');
        authenticationService.logout();
        return;
      }

      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getAllSchedules() {
    try {
      const { data: schedules } = await this._httpClient.sendRequest({
        endpoint: '/horarios/todos',
        method: HttpMethod.GET,
        headers: {
          Authorization: this._token,
        },
      });

      return schedules;
    } catch (error) {
      if (error.status === 401) {
        alert('Sessão expirada, faça login novamente');
        authenticationService.logout();
        return;
      }

      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getOverview() {
    try {
      const { data: overview } = await this._httpClient.sendRequest({
        endpoint: '/horarios/visao-geral',
        method: HttpMethod.GET,
        headers: {
          Authorization: this._token,
        },
      });

      return overview;
    } catch (error) {
      if (error.status === 401) {
        alert('Sessão expirada, faça login novamente');
        authenticationService.logout();
        return;
      }

      return {
        success: false,
        message: error.message,
      };
    }
  }

  async createSchedule(newSchedule) {
    try {
      const { data: response } = await this._httpClient.sendRequest({
        endpoint: '/horarios',
        method: HttpMethod.POST,
        body: newSchedule,
        headers: {
          Authorization: this._token,
        },
      });

      return response;
    } catch (error) {
      if (error.status === 401) {
        alert('Sessão expirada, faça login novamente');
        authenticationService.logout();
        return;
      }

      return {
        success: false,
        message: error.message,
        errors: error.errorData?.errors || [],
      };
    }
  }
}
