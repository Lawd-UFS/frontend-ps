import { HttpMethod } from '../infra/http/httpClient';

export class ScheduleService {
  constructor(httpClient, token) {
    if (!httpClient) {
      throw new Error(
        'É preciso passar uma instância da classe HttpClient no construtor',
      );
    }

    if (!token) {
      throw new Error('É preciso passar um token no construtor');
    }

    this._httpClient = httpClient;
    this._token = token;
  }

  async getEvaluatorSchedules() {
    const { data: schedules } = await this._httpClient.sendRequest({
      endpoint: '/horarios',
      method: HttpMethod.GET,
      headers: {
        Authorization: this._token,
      },
    });

    return schedules;
  }

  async createSchedule(newSchedule) {
    const { data: response } = await this._httpClient.sendRequest({
      endpoint: '/horarios',
      method: HttpMethod.POST,
      body: newSchedule,
      headers: {
        Authorization: this._token,
      },
    });

    return response;
  }
}
