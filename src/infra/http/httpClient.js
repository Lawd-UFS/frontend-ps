import axios from 'axios';

const API_URL = process.env.API_URL;

if (!API_URL) {
  throw new Error('Variável de url da api não informada');
}

export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

export class HttpClient {
  constructor(api = axios, baseUrl = API_URL) {
    this._api = api;
    this._baseUrl = baseUrl;
  }

  static create() {
    return new HttpClient();
  }

  async sendRequest(request) {
    const { endpoint, method, body, headers } = request;

    try {
      const response = await this._api.request({
        url: `${this._baseUrl}${endpoint}`,
        method,
        data: body,
        headers,
      });

      return response;
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      const errorData = error.response?.data || {};

      throw { status, message, errorData };
    }
  }
}
