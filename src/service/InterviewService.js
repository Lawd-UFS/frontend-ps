import { HttpMethod } from '../infra/http/httpClient';

export class InterviewService {
  constructor(httpClient, token, stateService) {
    if (!httpClient || !token) {
      return null;
    }

    this._httpClient = httpClient;
    this._token = token;
    this._stateService = stateService;

    this.questions = [
      {
        text: 'pode nos contar um pouco sobre você e sua trajetória acadêmica?',
        area: 'Perfil',
        score: 0,
        notes: null,
      },
      {
        text: 'o que te motivou a se inscrever na Liga Acadêmica de Desenvolvimento Web (LAWD)?',
        area: 'Perfil',
        score: 0,
        notes: null,
      },
      {
        text: 'qual área da liga acadêmica você estaria mais interessado em participar?',
        area: 'Perfil',
        score: 0,
        notes: null,
      },
      {
        text: 'você participa ou já participou de outras ligas, grupos de estudo ou projetos acadêmicos?',
        area: 'Softskills',
        score: 0,
        notes: null,
      },
      {
        text: 'como está a sua disponibilidade e como ficaria essa disponibilidade ao entrar na liga?',
        area: 'Perfil',
        score: 0,
        notes: null,
      },
      {
        text: 'você tem experiência com desenvolvimento frontend, backend, design? Pode nos contar um pouco?',
        area: 'Hardskills',
        score: 0,
        notes: null,
      },
      {
        text: 'como você abordou a resolução de um problema técnico desconhecido? Conte-nos um pouco sobre essa experiência.',
        area: 'Softskills',
        score: 0,
        notes: null,
      },
      {
        text: 'como você costuma agir em trabalhos em equipe? Diga uma situação em que houve discordância em um trabalho em equipe e como você fez para lidar com essa situação.',
        area: 'Softskills',
        score: 0,
        notes: null,
      },
      {
        text: 'tem alguma dúvida sobre a Liga ou o processo seletivo? / Há algo mais que gostaria de destacar sobre suas habilidades ou experiências?',
        area: 'Geral',
        score: 0,
        notes: null,
      },
    ];
  }

  getQuestions() {
    return this.questions;
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
      };
    }
  }
}
