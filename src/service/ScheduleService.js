import { HttpMethod } from '../infra/http/httpClient';

export class ScheduleService {
  constructor(httpClient) {
    if (!httpClient) {
      throw new Error(
        'É preciso passar uma instância da classe HttpClient no construtor',
      );
    }

    this._httpClient = httpClient;
  }

  async getEvaluatorSchedules(evaluatorId) {
    const schedules = await this._httpClient.sendRequest({
      endpoint: `/horarios/${evaluatorId}`,
      method: HttpMethod.GET,
    });

    return schedules;
  }

  async createSchedule(newSchedule) {
    const response = await this._httpClient.sendRequest({
      endpoint: '/horarios',
      method: HttpMethod.POST,
      body: newSchedule,
    });

    return response;
  }
}
