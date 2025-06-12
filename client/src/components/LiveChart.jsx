import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, TimeScale, Tooltip, Legend
} from 'chart.js';
import streamingPlugin from 'chartjs-plugin-streaming';
import 'chartjs-adapter-luxon';
import { Line } from 'react-chartjs-2';

// Register Chart.js and the streaming plugin
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  TimeScale, Tooltip, Legend, streamingPlugin
);

export default function LiveChart({ livePrices, indicator }) {
  const datasets = [
    {
      label: 'BTC/USD',
      borderColor: '#facc15',
      data: []
    }
  ];

  // Add indicator placeholder (MACD, RSI, etc.) as needed:
  if (indicator === 'RSI') {
    datasets.push({
      label: 'RSI',
      borderColor: '#10b981',
      data: []
    });
  }

  const options = {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          delay: 2000,
          refresh: 2000,
          onRefresh: chart => {
            const now = Date.now();
            const btc = livePrices['BITCOIN/USD'];
            if (btc !== undefined) {
              chart.data.datasets[0].data.push({ x: now, y: btc });
            }
          }
        }
      },
      y: { beginAtZero: false }
    }
  };

  return <Line data={{ datasets }} options={options} />;
}
