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

document.getElementById('create').addEventListener('click', async () => {
  try {
    const newSchedule = await scheduleService.createSchedule({
      dateTime: new Date('2025-10-10T17:00:00'),
      evaluatorId: 'f1cae52d22fafe9bdf0d9001',
    });

    alert(JSON.stringify(newSchedule));
  } catch (error) {
    alert(`
        Ocorreu um erro!
        ${error.toString()}
    `);
  }
});
