import { HttpMethod, HttpClient } from '../../infra/http/httpClient.js';

const client = HttpClient.create();

export async function submitRegister(data) {
  try {
    const response = await client.sendRequest({
      method: HttpMethod.POST,
      endpoint: '/candidatos',
      body: data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    return { success: false, message: error.message };
  }
}
