import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  Filler,
  Tooltip,
} from 'chart.js';

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  Filler,
  Tooltip,
);

function createRoundedPolygonPath(ctx, vertices, radius) {
  if (vertices.length < 3) return;

  const len = vertices.length;

  // Calcula o ponto de partida: desloca o primeiro vértice em direção ao segundo
  const p0 = vertices[0];
  const p1 = vertices[1];
  const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
  ctx.moveTo(p0.x + Math.cos(angle) * radius, p0.y + Math.sin(angle) * radius);

  for (let i = 0; i < len; i++) {
    const next = vertices[(i + 1) % len];
    const afterNext = vertices[(i + 2) % len];

    // Desenha uma aresta com transição arredondada
    ctx.arcTo(next.x, next.y, afterNext.x, afterNext.y, radius);
  }
}

// Plugin para redesenhar o grid do gráfico radar com cantos arredondados
const roundedRadarGridPlugin = {
  id: 'roundedRadarGrid',
  // Executa antes do desenho dos datasets
  beforeDraw(chart) {
    const {
      ctx,
      scales: { r },
    } = chart;
    const numLevels = r.ticks.length; // Número de níveis do grid
    const numPoints = chart.data.labels.length; // Número de lados do polígono
    const centerX = r.xCenter;
    const centerY = r.yCenter;
    const maxRadius = r.drawingArea * 1.04;
    const angleStep = (Math.PI * 2) / numPoints;
    const roundness = 15; // Valor de arredondamento (ajuste conforme necessário)

    ctx.save();
    ctx.strokeStyle = '#9988CE'; // Cor do grid
    ctx.fillStyle = 'rgba(129, 112, 180, 0.1)';
    ctx.lineWidth = 1;

    // Para cada nível, calcula os vértices do polígono e desenha com bordas arredondadas
    for (let level = 1; level <= numLevels; level++) {
      const radius = (maxRadius / numLevels) * level;
      const vertices = [];

      for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2; // Inicia do topo (12h)
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        vertices.push({ x, y });
      }

      ctx.beginPath();
      createRoundedPolygonPath(ctx, vertices, roundness);
      ctx.closePath();

      if (level === numLevels) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }

    ctx.restore();
  },
};

// Registra o plugin no Chart.js
Chart.register(roundedRadarGridPlugin);

export const Radar = (canvas, data) => {
  const dataChart = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data).map(
          (area) => area.value / area.maxPossibleValue,
        ),
        borderColor: '#8170b4',
        backgroundColor: 'rgba(74, 56, 123, 0.3)',
        pointRadius: 4,
        pointBackgroundColor: '#EFF2FF',
        pointBorderColor: '#A6B5F6',
        fill: true,
      },
    ],
  };

  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'radar',
    data: dataChart,
    options: {
      scales: {
        r: {
          pointLabels: {
            display: true,
            font: {
              size: 16,
              weight: 'normal',
              family: 'Space Grotesk',
            },
            color: '#4A387B',
            padding: 15,
          },
          ticks: {
            display: false,
            stepSize: 0.4,
          },
          grid: {
            display: false,
          },
          suggestedMin: 0,
          suggestedMax: 1,
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.r;
              return (value * 100).toFixed(2) + '%';
            },
          },
        },
      },
    },
  });

  return chart;
};
