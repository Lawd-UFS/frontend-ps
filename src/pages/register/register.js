import { HttpMethod, HttpClient } from '../../infra/http/httpClient.js'

    const client = HttpClient.create()

    export async function submitRegister(data) {

      data.period = parseInt(data.period)

      try{
        const response = await client.sendRequest({method: 'POST', endpoint: '/candidatos', body: data})
        console.log(response)
        return response;
      } catch(error) {
        return {success: false, message: error.message}
      }
    };