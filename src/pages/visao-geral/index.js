import { authenticationService } from '../../service/AuthenticationService';

if (!authenticationService.isAuthenticated()) {
  window.location.href = '/login';
}

import './index.css';
import { Header } from '../../components/Header';
import { HttpClient, HttpMethod } from '../../infra/http/httpClient';
import Chart from 'chart.js/auto';

const httpClient = HttpClient.create();

const normalizeCourseName = (course) => {
  if (!course) return '';
  const normalized = course
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    normalized === 'cc' ||
    normalized.includes('ciencia da computacao') ||
    normalized.includes('ciencias da computacao') ||
    normalized.includes('ciencia computacao') ||
    normalized.includes('ciencias computacao')
  ) {
    return 'Ciência da Computação';
  }
  if (
    normalized === 'si' ||
    normalized.includes('sistemas de informacao') ||
    normalized.includes('sistema de informacao') ||
    normalized.includes('sistemas informacao') ||
    normalized.includes('sistema informacao')
  ) {
    return 'Sistemas de Informação';
  }
  if (
    normalized === 'ec' ||
    normalized.includes('engenharia da computacao') ||
    normalized.includes('engenharia de computacao') ||
    normalized.includes('engenharia computacao')
  ) {
    return 'Engenharia da Computação';
  }

  const wordCorrections = {
    ciencia: 'Ciência',
    ciencias: 'Ciências',
    computacao: 'Computação',
    sistema: 'Sistema',
    sistemas: 'Sistemas',
    informacao: 'Informação',
    informacoes: 'Informações',
    engenharia: 'Engenharia',
    estatistica: 'Estatística',
    matematica: 'Matemática',
    fisica: 'Física',
    quimica: 'Química',
    administracao: 'Administração',
    mecanica: 'Mecânica',
    eletrica: 'Elétrica',
    producao: 'Produção',
    civil: 'Civil',
    de: 'de',
    da: 'da',
    do: 'do',
    dos: 'dos',
    das: 'das',
    e: 'e',
  };

  const words = normalized.split(/\s+/);
  return words
    .map((word) => {
      if (wordCorrections[word]) {
        return wordCorrections[word];
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

// Funções para buscar dados dos endpoints
const fetchData = async (endpoint) => {
  try {
    const { data: response } = await httpClient.sendRequest({
      endpoint,
      method: HttpMethod.GET,
      headers: {
        Authorization: authenticationService.getToken(),
      },
    });
    return response;
  } catch (error) {
    console.error(`Erro ao buscar dados do endpoint ${endpoint}:`, error);
    return null;
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const header = await Header();
  document.body.prepend(header);

  // Exibir tela de loading
  const kpis = {
    candidates: document.getElementById('kpi-total-candidates'),
    scheduled: document.getElementById('kpi-scheduled-interviews'),
    completed: document.getElementById('kpi-completed-interviews'),
    slots: document.getElementById('kpi-free-slots'),
  };

  // Carregar dados de candidatos, entrevistas e horários em paralelo
  const [candidatesRes, interviewsRes, schedulesRes, availableSchedulesRes] = await Promise.all([
    fetchData('/candidatos?limit=99999'),
    fetchData('/entrevistas'),
    fetchData('/horarios/todos'),
    fetchData('/agendamento/disponiveis'),
  ]);

  const candidates = candidatesRes?.data || [];
  const interviews = interviewsRes?.data || [];
  const reservedSchedules = schedulesRes?.data || [];
  const availableSchedules = availableSchedulesRes?.data || [];

  // Atualizar os KPIs
  kpis.candidates.innerText = candidates.length;
  kpis.scheduled.innerText = reservedSchedules.length;
  kpis.completed.innerText = interviews.length;
  kpis.slots.innerText = availableSchedules.length;

  // 1. Processar dados para: Distribuição por Curso
  const courseCounts = {};
  candidates.forEach((c) => {
    const name = normalizeCourseName(c.course) || 'Não Informado';
    courseCounts[name] = (courseCounts[name] || 0) + 1;
  });

  const courseLabels = Object.keys(courseCounts);
  const courseData = Object.values(courseCounts);

  new Chart(document.getElementById('chart-courses'), {
    type: 'bar',
    data: {
      labels: courseLabels,
      datasets: [
        {
          label: 'Candidatos',
          data: courseData,
          backgroundColor: '#7046e9',
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  });

  // 2. Processar dados para: Nível de Conhecimento
  const knowledgeCounts = { Nenhum: 0, Iniciante: 0, Intermediário: 0, Avançado: 0 };
  candidates.forEach((c) => {
    const lvl = c.knowledgeLevel || 'Nenhum';
    if (knowledgeCounts[lvl] !== undefined) {
      knowledgeCounts[lvl]++;
    } else {
      knowledgeCounts['Nenhum']++;
    }
  });

  new Chart(document.getElementById('chart-knowledge'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(knowledgeCounts),
      datasets: [
        {
          data: Object.values(knowledgeCounts),
          backgroundColor: ['#eff2ff', '#bba6f8', '#7046e9', '#4623a7'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' },
      },
    },
  });

  // 3. Processar dados para: Distribuição por Período
  const periodCounts = {};
  candidates.forEach((c) => {
    const p = c.period ? `${c.period}º` : 'Não Informado';
    periodCounts[p] = (periodCounts[p] || 0) + 1;
  });

  // Ordenar os períodos
  const periodLabels = Object.keys(periodCounts).sort((a, b) => {
    const numA = parseInt(a) || 999;
    const numB = parseInt(b) || 999;
    return numA - numB;
  });
  const periodData = periodLabels.map((l) => periodCounts[l]);

  new Chart(document.getElementById('chart-periods'), {
    type: 'bar',
    data: {
      labels: periodLabels,
      datasets: [
        {
          label: 'Candidatos',
          data: periodData,
          backgroundColor: '#4a387b',
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  });

  // 4. Processar dados para: Status do Processo
  // Agendado = reservedSchedules.length
  // Entrevistado = interviews.length
  // Pendentes = Total Inscritos - Agendado - Entrevistado (ou simplesmente candidatos sem agendamento nem entrevista)
  const scheduledCandidateIds = new Set(
    reservedSchedules.map((s) => s.candidate?.id || s.candidate?._id).filter(Boolean),
  );
  const interviewedCandidateIds = new Set(
    interviews.map((i) => i.candidate?.id || i.candidate?._id).filter(Boolean),
  );

  let pendingCount = 0;
  let scheduledCount = 0;
  let interviewedCount = 0;

  candidates.forEach((c) => {
    const id = c.id || c._id;
    if (interviewedCandidateIds.has(id)) {
      interviewedCount++;
    } else if (scheduledCandidateIds.has(id)) {
      scheduledCount++;
    } else {
      pendingCount++;
    }
  });

  new Chart(document.getElementById('chart-status'), {
    type: 'pie',
    data: {
      labels: ['Pendente Agendamento', 'Agendado', 'Entrevistado'],
      datasets: [
        {
          data: [pendingCount, scheduledCount, interviewedCount],
          backgroundColor: ['#eff2ff', '#bba6f8', '#7046e9'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' },
      },
    },
  });
});
