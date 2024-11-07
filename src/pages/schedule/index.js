import { ScheduleService } from '../../service/ScheduleService';
import { HttpClient } from '../../infra/http/httpClient';

const scheduleService = new ScheduleService(HttpClient.create());

document.getElementById('get-all').addEventListener('click', async () => {
  try {
    const schedules = await scheduleService.getEvaluatorSchedules(
      'f1cae52d22fafe9bdf0d9001',
    );

    alert(JSON.stringify(schedules));
  } catch (error) {
    alert(`
        Ocorreu um erro!
        ${error.toString()}
    `);
  }
});
