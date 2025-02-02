import { HttpMethod, HttpClient } from '../../infra/http/httpClient.js'

    const client = HttpClient.create()
    
    const form = document.querySelector('.form');

    form.addEventListener('submit', async event => {

      event.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      data.period = parseInt(data.period)

      console.log(JSON.stringify(data));
      try{
        const response = await client.sendRequest({method: 'POST', endpoint: '/candidatos', body: data})
        console.log(response);
      } catch(error) {
        console.error(error)
      }
    });