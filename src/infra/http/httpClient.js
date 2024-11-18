import axios from 'axios';

export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

export class HttpClient {
  constructor(api = axios, baseUrl = process.env.API_URL) {
    this._api = api;
    this._baseUrl = baseUrl;
  }

  static create() {
    return new HttpClient();
  }

  async sendRequest(request) {
    const { endpoint, method, body, headers } = request;

    try {
      const { data } = await this._api.request({
        url: `${this._baseUrl}${endpoint}`,
        method,
        data: body,
        headers,
      });

      return data;
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data || error.message;

      throw new Error(`Requisição falhou com status ${status}: ${message}`);
    }
  }
}
