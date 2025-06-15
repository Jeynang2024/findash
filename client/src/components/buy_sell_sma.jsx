import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import "../styles/header.css";
const fetchKlines = async (symbol = 'BTCUSDT', interval = '1m', limit = 500, startTime) => {
  const params = new URLSearchParams({ symbol, interval, limit: limit.toString() });
  if (startTime) params.append('startTime', startTime.toString());
  const res = await fetch(`https://api.binance.com/api/v3/klines?${params}`);
  const data = await res.json();
  return data.map(c => ({
    x: c[0],
    y: [+c[1], +c[2], +c[3], +c[4]],
  }));
};

const sma = (arr, N) =>
  arr.length >= N ? arr.slice(-N).reduce((a, v) => a + v, 0) / N : null;

const ApexBacktestChart = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1m');
  const [shortSMA, setShortSMA] = useState(20);
  const [longSMA, setLongSMA] = useState(50);
  const [candles, setCandles] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchKlines(symbol, interval, 1000, Date.now() - 24 * 60 * 60 * 1000);
      setCandles(data);
      const s = [];
      const closes = data.map(c => c.y[3]);

      for (let i = longSMA; i < closes.length; i++) {
        const prevShort = sma(closes.slice(i - longSMA, i), shortSMA);
        const prevLong = sma(closes.slice(i - longSMA, i), longSMA);
        const curShort = sma(closes.slice(i - longSMA + 1, i + 1), shortSMA);
        const curLong = sma(closes.slice(i - longSMA + 1, i + 1), longSMA);

        if (prevShort !== null && prevLong !== null && curShort !== null && curLong !== null) {
          if (prevShort < prevLong && curShort > curLong) {
            s.push({
              x: data[i].x,
              y: data[i].y[3],
              fillColor: 'green',
              strokeColor: 'green',
              text: 'BUY',
            });
          } else if (prevShort > prevLong && curShort < curLong) {
            s.push({
              x: data[i].x,
              y: data[i].y[3],
              fillColor: 'red',
              strokeColor: 'red',
              text: 'SELL',
            });
          }
        }
      }
      setSignals(s);
    } catch (error) {
      console.error("Error loading chart data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [interval, symbol, shortSMA, longSMA]);

  const options = {
    chart: { 
      type: 'candlestick', 
      height: 350, 
      background: '#1e1b2e', 
      foreColor: '#f1f5f9',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    plotOptions: {
      candlestick: {
        colors: { upward: '#00B746', downward: '#EF403C' },
        wick: { useFillColor: true },
      },
    },
    xaxis: { type: 'datetime' },
    annotations: {
      points: signals.map(sig => ({
        x: sig.x,
        y: sig.y,
        marker: {
          size: 6,
          fillColor: sig.fillColor,
          strokeColor: sig.strokeColor,
          shape: 'circle',
        },
        label: {
          text: sig.text,
          style: { background: sig.fillColor, color: '#fff' },
        },
      })),
    },
  };

  const series = [{ data: candles }];

  return (
    <div className="p-4 gradient-border text-white ">
      <h2 className="text-xl font-semibold mb-4 text-gradient">Backtest SMA Strategy</h2>

      <div className="flex flex-wrap gap-4 mb-6">
               <div className="flex-1 min-w-[120px]">

          <label className="block h-[40px] text-sm text-gray-400 mb-1">Symbol</label>

        <input
        style={{ backgroundColor: '#1e1b2e	' }} 
          className="p-2 w-full  rounded border border-slate-700"
          placeholder="Symbol (e.g. BTCUSDT)"
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
        /></div>
               <div className="flex-1 min-w-[120px]">

                  <label className="block h-[40px] text-sm text-gray-400 mb-1">Interval</label>

        <select
  style={{ backgroundColor: '#1e1b2e	' }} // ✅ React inline style (correct syntax)
          className="p-2 w-full bg-slate-800 rounded border border-slate-700"
          value={interval}
          onChange={e => setInterval(e.target.value)}
        >
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hours</option>
          <option value="1d">1 Day</option>
        </select>
        </div>
               <div className="flex-1 min-w-[120px]">

                  <label className="block h-[40px] text-sm text-gray-400 mb-1">Short sma</label>

        <input
        style={{ backgroundColor: '#1e1b2e	' }} 
          className="p-2 w-full  rounded border border-slate-700"
          type="number"
          placeholder="Short SMA"
          value={shortSMA}
          onChange={e => setShortSMA(Math.max(1, Number(e.target.value)))}
          min="1"
        /></div>
        <div className="flex-1 min-w-[120px]">

                  <label className="block h-[40px] text-sm text-gray-400 mb-1">Long sma</label>

        <input
        style={{ backgroundColor: '#1e1b2e	' }} 
          className="p-2 w-full  rounded border border-slate-700"
          type="number"
          placeholder="Long SMA"
          value={longSMA}
          onChange={e => setLongSMA(Math.max(shortSMA + 1, Number(e.target.value)))}
          min={shortSMA + 1}
        />
        </div>
                        <div className="flex-1 min-w-[120px] flex items-end">

        <button
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 disabled:bg-blue-800"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load Chart'}
        </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : candles.length > 0 ? (
        <Chart options={options} series={series} type="candlestick" height={450} />
      ) : (
        <div className="bg-slate-800 p-8 rounded-lg text-center">
          <p>No data available. Try adjusting your parameters.</p>
        </div>
      )}
    </div>
  );
};

export default ApexBacktestChart;