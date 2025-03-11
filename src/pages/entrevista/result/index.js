import './styles.css';

import * as Chart from '../../../components/Chart';

import Interview from '../../../components/Interview';
import {
  fetchInterviewCandidate,
  fetchInterviewResult,
  fetchInterviewRanking,
} from '../interviewHandler';

export const ResultPage = async () => {
  const div = document.createElement('div');
  div.setAttribute('id', 'result');

  const resultPageLink = document.getElementById('result-link');
  resultPageLink.setAttribute('active', '');

  const candidate = await fetchInterviewCandidate();
  const { media: _, ...resultPerArea } = await fetchInterviewResult();
  const ranking = await fetchInterviewRanking();

  const chartContainer = document.createElement('div');
  const canvas = document.createElement('canvas');
  chartContainer.setAttribute('id', 'chart');
  chartContainer.appendChild(canvas);

  const chartData = {};

  for (const [area, value] of Object.entries(resultPerArea)) {
    chartData[area.capitalize()] = value / 10;
  }

  const chart = Chart.Radar(canvas, chartData);

  div.appendChild(chartContainer);
  div.appendChild(
    Interview.Summary(
      {
        candidateName: candidate.name,
        candidatePhoto: candidate.profilePhotoUrl,
      },
      resultPerArea,
      ranking,
    ),
  );

  return div;
};
