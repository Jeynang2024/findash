import React, { useRef, useEffect } from 'react';
import { Chart, LinearScale, TimeScale, BarElement, LineElement, PointElement, CategoryScale, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(
  LinearScale, TimeScale, BarElement, LineElement, PointElement, CategoryScale, Tooltip, Legend
);

export default function BacktestChart({ candles, indicator }) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!candles.length) return;

    const ctx = canvasRef.current.getContext('2d');
    let chart;
    const times = candles.map(c => c.time);
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume);

    const datasets = [];
    datasets.push({
      type: 'line',
      label: 'Close',
      data: times.map((t, i) => ({ x: t, y: closes[i] })),
      borderColor: '#facc15',
      borderWidth: 2,
      fill: false
    });

    if (indicator === 'SMA') {
      const sma = movingAverage(closes, 14);
      datasets.push({
        type: 'line',
        label: 'SMA(14)',
        data: sma.map((v, i) => ({ x: times[i + 13], y: v })),
        borderColor: '#3b82f6',
        borderWidth: 2,
        fill: false
      });
    }

    if (indicator === 'Volume') {
      datasets.push({
        type: 'bar',
        label: 'Volume',
        data: times.map((t, i) => ({ x: t, y: volumes[i] })),
        backgroundColor: '#6b7280'
      });
    }

    if (indicator === 'RSI') {
      const rsi = calcRSI(closes, 14);
      const rsiDataset = {
        type: 'line',
        label: 'RSI',
        data: rsi.map((v, i) => ({ x: times[i + 14], y: v * (Math.max(...closes) / 100) })),
        borderColor: '#10b981',
        borderWidth: 2,
        fill: false
      };
      datasets.push(rsiDataset);
      // Backtest: buy when RSI<30, sell when >70
      const signals = rsi.map((v, i) => ({ type: v < 30 ? 'buy' : v > 70 ? 'sell' : null, index: i + 14 }));
      addSignalMarkers(signals, datasets, times, closes);
    }

    if (indicator === 'MACD') {
      const { macd, signal } = calcMACD(closes);
      datasets.push({
        type: 'line',
        label: 'MACD',
        data: macd.map((v, i) => ({ x: times[i + 26], y: v })),
        borderColor: '#ef4444',
        borderWidth: 2,
        fill: false
      });
      datasets.push({
        type: 'line',
        label: 'Signal',
        data: signal.map((v, i) => ({ x: times[i + 26], y: v })),
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderDash: [5, 5],
        fill: false
      });
      const signals = macd.map((v, i) => {
        if (i === 0) return null;
        const prev = macd[i - 1], curr = macd[i];
        const prevSig = signal[i - 1], currSig = signal[i];
        return curr > currSig && prev <= prevSig ? { type: 'buy', index: i + 26 }
             : curr < currSig && prev >= prevSig ? { type: 'sell', index: i + 26 }
             : null;
      });
      addSignalMarkers(signals, datasets, times, closes);
    }

    chart = new Chart(ctx, {
      data: { datasets },
      options: {
        scales: {
          x: { type: 'time' },
          y: { type: 'linear', position: 'left' }
        },
        plugins: { legend: { position: 'bottom' } }
      }
    });

    return () => chart.destroy();

  }, [candles, indicator]);

  // Helpers...
  function movingAverage(data, N) {
    return data.slice(N - 1).map((_, i) =>
      data.slice(i, i + N).reduce((a, b) => a + b) / N
    );
  }

  function calcRSI(data, N) {
    let gains = 0, losses = 0;
    for (let i = 1; i <= N; i++) {
      const diff = data[i] - data[i - 1];
      gains += Math.max(diff, 0);
      losses += Math.max(-diff, 0);
    }
    const rs = gains / losses;
    let rsi = Array(data.length).fill(null);
    rsi[N] = 100 - 100 / (1 + rs);
    for (let i = N + 1; i < data.length; i++) {
      const diff = data[i] - data[i - 1];
      gains = gains * (N - 1) / N + Math.max(diff, 0);
      losses = losses * (N - 1) / N + Math.max(-diff, 0);
      rsi[i] = 100 - 100 / (1 + gains / losses);
    }
    return rsi;
  }

  function calcMACD(data, fast = 12, slow = 26, sig = 9) {
    function ema(series, N) {
      const k = 2 / (N + 1);
      const res = [series.slice(0, N).reduce((a, b) => a + b) / N];
      for (let i = N; i < series.length; i++) {
        res.push(series[i] * k + res[res.length - 1] * (1 - k));
      }
      return res;
    }
    const emaFast = ema(data, fast);
    const emaSlow = ema(data, slow);
    const macd = emaFast.slice(slow - fast).map((f, i) => f - emaSlow[i]);
    const signal = ema(macd, sig);
    return { macd, signal };
  }

  function addSignalMarkers(signals, datasets, times, closes) {
    const buys = signals.filter(s => s && s.type === 'buy');
    const sells = signals.filter(s => s && s.type === 'sell');

    if (buys.length) {
      datasets.push({
        type: 'scatter',
        label: 'Buy',
        data: buys.map(s => ({ x: times[s.index], y: closes[s.index] })),
        pointBackgroundColor: 'green',
        pointBorderColor: 'white',
        pointRadius: 6
      });
    }
    if (sells.length) {
      datasets.push({
        type: 'scatter',
        label: 'Sell',
        data: sells.map(s => ({ x: times[s.index], y: closes[s.index] })),
        pointBackgroundColor: 'red',
        pointBorderColor: 'white',
        pointRadius: 6
      });
    }
  }

  return <canvas ref={canvasRef} />;
}
