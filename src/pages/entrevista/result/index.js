import './styles.css';

import * as Chart from '../../../components/Chart';

import Interview from '../../../components/Interview';

export const ResultPage = async () => {
  const div = document.createElement('div');
  div.setAttribute('id', 'result');

  const resultPageLink = document.getElementById('result-link');
  resultPageLink.setAttribute('active', '');

  const scoreValues = {
    Insuficiente: 0,
    Razoável: 1,
    Bom: 2,
    Excelente: 3,
  };

  const questions = [
    {
      area: 'Liderança',
      score: 'Insuficiente',
    },
    {
      area: 'Valores da liga',
      score: 'Razoável',
    },
    {
      area: 'Comunicação',
      score: 'Bom',
    },
    {
      area: 'Liderança',
      score: 'Bom',
    },
    {
      area: 'Conhecimento',
      score: 'Excelente',
    },
    {
      area: 'Conhecimento',
      score: 'Bom',
    },
    {
      area: 'Experiência',
      score: 'Bom',
    },
  ];

  const scorePerArea = questions.reduce((acc, { area, score }) => {
    if (!acc[area]) {
      acc[area] = { value: 0, maxPossibleValue: 0 };
    }

    acc[area].value += scoreValues[score];
    acc[area].maxPossibleValue += scoreValues.Excelente;

    return acc;
  }, {});

  const chartContainer = document.createElement('div');
  const canvas = document.createElement('canvas');
  chartContainer.setAttribute('id', 'chart');
  chartContainer.appendChild(canvas);

  const chart = Chart.Radar(canvas, scorePerArea);

  div.appendChild(chartContainer);
  div.appendChild(Interview.Summary('João', scorePerArea));

  return div;
};
