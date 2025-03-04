import { HttpMethod } from '../infra/http/httpClient';

export class InterviewService {
  constructor(httpClient, token) {
    if (!httpClient || !token) {
      return null;
    }

    this._httpClient = httpClient;
    this._token = token;

    this.questions = [
      {
        text: 'Pode nos contar um pouco sobre você e sua trajetória acadêmica?',
        area: 'Perfil',
        score: null,
        notes: null,
      },
      {
        text: 'O que te motivou a se inscrever na Liga Acadêmica de Desenvolvimento Web (LAWD)?',
        area: 'Perfil',
        score: null,
        notes: null,
      },
      {
        text: 'Qual área da liga acadêmica você estaria mais interessado em participar?',
        area: 'Perfil',
        score: null,
        notes: null,
      },
      {
        text: 'Você participa ou já participou de outras ligas, grupos de estudo ou projetos acadêmicos?',
        area: 'Softskills',
        score: null,
        notes: null,
      },
      {
        text: 'Como está a sua disponibilidade e como ficaria essa disponibilidade ao entrar na liga?',
        area: 'Perfil',
        score: null,
        notes: null,
      },
      {
        text: 'Você tem experiência com desenvolvimento frontend, backend, design? Pode nos contar um pouco?',
        area: 'Hardskills',
        score: null,
        notes: null,
      },
      {
        text: 'Como você abordou a resolução de um problema técnico desconhecido? Conte-nos um pouco sobre essa experiência.',
        area: 'Softskills',
        score: null,
        notes: null,
      },
      {
        text: 'Como você costuma agir em trabalhos em equipe? Diga uma situação em que houve discordância em um trabalho em equipe e como você fez para lidar com essa situação.',
        area: 'Softskills',
        score: null,
        notes: null,
      },
      {
        text: 'Tem alguma dúvida sobre a Liga ou o processo seletivo? / Há algo mais que gostaria de destacar sobre suas habilidades ou experiências?',
        area: 'Geral',
        score: null,
        notes: null,
      },
    ];
  }

  getQuestions() {
    return this.questions;
  }

  async getInterview(candidateId) {
    try {
      const { data: response } = await this._httpClient.sendRequest({
        endpoint: `/entrevistas/candidato/${candidateId}`,
        method: HttpMethod.GET,
        headers: {
          Authorization: this._token,
        },
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async saveInterview({ candidateId, evaluatorId, questions }) {
    const date = new Date();

    try {
      const { data: response } = await this._httpClient.sendRequest({
        endpoint: '/entrevistas',
        method: HttpMethod.POST,
        headers: {
          Authorization: this._token,
        },
        body: {
          candidateId,
          evaluatorId,
          date,
          questions,
        },
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
