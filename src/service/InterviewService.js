import { HttpMethod } from '../infra/http/httpClient';

export class InterviewService {
  constructor(httpClient, token, stateService) {
    if (!httpClient || !token) {
      return null;
    }

    this._httpClient = httpClient;
    this._token = token;
    this._stateService = stateService;

    this.questions = null;
  }

  getQuestions() {
    return this.questions;
  }

  async loadScript() {
    if (this.questions) {
      return true;
    }

    try {
      const { data: response } = await this._httpClient.sendRequest({
        endpoint: '/roteiro',
        method: HttpMethod.GET,
        headers: {
          Authorization: this._token,
        },
      });

      this.questions = response.data;

      return true;
    } catch (error) {
      this.questions = null;

      return false;
    }
  }

  async getInterview(candidateId) {
    const cachedData = this._stateService.getState('interview');

    if (cachedData && cachedData.status === 'new') {
      const { data: response } = await this._httpClient.sendRequest({
        endpoint: `/candidatos/${cachedData.candidate.id}`,
        method: HttpMethod.GET,
        headers: {
          Authorization: this._token,
        },
      });

      this._stateService.saveState('interview', {
        ...cachedData,
        candidate: response.data,
      });

      return {
        success: true,
        data: {
          status: 'new',
          candidate: cachedData.candidate,
          evaluator: cachedData.evaluator,
          questions: this.questions,
          date: cachedData.date,
          result: {
            softskills: 0,
            hardskills: 0,
            disponibilidade: 0,
          },
          ranking: null,
        },
      };
    }

    if (cachedData && cachedData.candidateId === candidateId) {
      return {
        success: true,
        data: cachedData,
      };
    }

    try {
      const { data: response } = await this._httpClient.sendRequest({
        endpoint: `/entrevistas/candidato/${candidateId}`,
        method: HttpMethod.GET,
        headers: {
          Authorization: this._token,
        },
      });

      delete response.data.result._id;

      this._stateService.saveState('interview', {
        ...response.data,
        status: 'old',
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async saveInterview({ candidateId, questions, date }) {
    try {
      const { data: response } = await this._httpClient.sendRequest({
        endpoint: '/entrevistas',
        method: HttpMethod.POST,
        headers: {
          Authorization: this._token,
        },
        body: {
          candidateId,
          date,
          questions,
        },
      });

      this._stateService.saveState('interview', {
        ...response.data,
        status: 'old',
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errorData.errors,
      };
    }
  }
}
