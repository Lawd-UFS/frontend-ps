import Interview from '../../../components/Interview';
import './styles.css';

export const ApplyPage = () => {
  const div = document.createElement('div');
  div.setAttribute('id', 'apply');

  const applyPageLink = document.getElementById('apply-link');
  applyPageLink.setAttribute('active', '');

  div.appendChild(
    Interview.Instructions([
      {
        title: 'Excelente',
        text: 'Esse é lawd na veia',
      },
      {
        title: 'Bom',
        text: 'Alecrim dourado',
      },
      {
        title: 'Razoável',
        text: 'ta ok',
      },
      {
        title: 'Insuficiente',
        text: 'Ruim demais, cê é loko',
      },
    ]),
  );

  div.appendChild(
    Interview.Questions([
      {
        text: 'por que você deseja fazer parte da LAWD?',
        area: 'Valores da liga',
        score: 'Bom',
      },
      {
        text: 'por que você deseja fazer parte da LAWD?',
        area: 'Valores da liga',
        score: 'Bom',
      },
      {
        text: 'por que você deseja fazer parte da LAWD?',
        area: 'Valores da liga',
        score: 'Bom',
      },
    ]),
  );

  div.appendChild(
    Interview.Stages(['Seção 01', 'Seção 02', 'Seção 03', 'Seção 04']),
  );

  return div;
};
