import React, { useEffect, useState,useRef } from 'react';
import Chart from 'react-apexcharts';
import "../styles/header.css";
const IST_OFFSET = 5.5 * 60 * 60 * 1000;  // 5 hours 30 minutes = 19800000 ms


const toUnixTimestamp = (datetimeStr) => new Date(datetimeStr).getTime();



const fetchKlines = async (symbol = 'BTCUSDT', interval = '1m', limit = 500, startTime,endTime) => {
  const params = new URLSearchParams({ symbol, interval, limit: limit });
  console.log(startTime, endTime);
  if (startTime) {
    const startUTC = toUnixTimestamp(startTime)- IST_OFFSET;
    params.append('startTime', startUTC);
    console.log("startTime (UTC):", startUTC, new Date(startUTC).toISOString());
  }
  
  if (endTime) {
    const endUTC = toUnixTimestamp(endTime)- IST_OFFSET;
    params.append('endTime', endUTC);
    console.log("endTime (UTC):", endUTC, new Date(endUTC).toISOString());
  }

  const url = `https://api.binance.com/api/v3/klines?${params}`;
  console.log("Final API URL:", url);
  const res = await fetch(`https://api.binance.com/api/v3/klines?${params}`);
  const data = await res.json();
if (data.length > 0) {
    const firstTime = new Date(data[0][0]).toISOString();
    const lastTime = new Date(data[data.length - 1][0]).toISOString();
    console.log(`Fetched ${data.length} candles from ${firstTime} to ${lastTime}`);
  } else {
    console.log("No data returned from Binance.");
  }
  return data.map(c => ({
    x: c[0]+IST_OFFSET,
    y: [+c[1], +c[2], +c[3], +c[4]],
  }));
};


/*
const fetchKlines = async (symbol = 'BTCUSDT', interval = '1m', limit = 500, startTime) => {
  const params = new URLSearchParams({ symbol, interval, limit: limit.toString() });
  if (startTime) params.append('startTime', startTime.toString());
  const res = await fetch(`https://api.binance.com/api/v3/klines?${params}`);
  const data = await res.json();
  return data.map(c => ({
    x: c[0]+IST_OFFSET,
    y: [+c[1], +c[2], +c[3], +c[4]], // OHLC
  }));
};
*/
const ema = (arr, period) => {
  if (arr.length < period) return [];
  const k = 2 / (period + 1);
  const emaArray = [];
  let prev = arr.slice(0, period).reduce((a, b) => a + b, 0) / period;
  emaArray.push(prev);

  for (let i = period; i < arr.length; i++) {
    const next = arr[i] * k + prev * (1 - k);
    emaArray.push(next);
    prev = next;
  }

  return Array(period - 1).fill(null).concat(emaArray);
};

const EMAChart = () => {
   const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1m');
  const [shortEMA, setShortEMA] = useState(20);
  const [longEMA, setLongEMA] = useState(50);
  const [candles, setCandles] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {

      const data = await fetchKlines(symbol, interval, 1000, startTime,endTime);
       if (chartRef.current) {
        chartRef.current.updateOptions({
          xaxis: {
            min: data.length ? data[0].x : null,
            max: data.length ? data[data.length - 1].x : null
          }
        }, true); // The second argument forces a redraw
      }
      //const data = await fetchKlines(symbol, interval, 1000, Date.now() - 24 * 60 * 60 * 1000);
      setCandles(data);
      const closes = data.map(c => c.y[3]); // Close prices

      const short = ema(closes, shortEMA);
      const long = ema(closes, longEMA);

      const s = [];
      for (let i = 1; i < data.length; i++) {
        if (
          short[i - 1] !== null &&
          long[i - 1] !== null &&
          short[i] !== null &&
          long[i] !== null
        ) {
          // Cross from below → BUY
          if (short[i - 1] < long[i - 1] && short[i] > long[i]) {
            s.push({
              x: data[i].x,
              y: data[i].y[3],
              fillColor: 'green',
              strokeColor: 'green',
              text: 'BUY',
            });
          }
          // Cross from above → SELL
          else if (short[i - 1] > long[i - 1] && short[i] < long[i]) {
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
    } catch (err) {
      console.error("Error loading EMA chart data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [interval, symbol, shortEMA, longEMA, startTime, endTime]);

  const options = {
    chart: { 
      type: 'candlestick', 
      height: 350, 
      background: '#1e1b2e', 
      foreColor: '#f1f5f9'
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
      <h2 className="text-xl font-semibold mb-4 text-gradient">Backtest EMA Strategy</h2>

      <div className="flex flex-wrap gap-4 mb-6">
       <div className="flex-1 min-w-[120px]">
          <label className="block h-[40px] text-sm text-gray-400 mb-1">Symbol</label>
          <input 
                          style={{ backgroundColor: '#1e1b2e	' }} 

            className="w-full h-[40px] p-2 bg-slate-800 rounded border border-slate-700" 
            value={symbol} 
            onChange={e => setSymbol(e.target.value.toUpperCase())} 
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block h-[40px] text-sm text-gray-400 mb-1">Interval</label>
          <select
            style={{ backgroundColor: '#1e1b2e	' }} // ✅ React inline style (correct syntax)

            className="w-full h-[40px]  p-2 bg-slate-800 rounded border border-slate-700"
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
          <label className="block h-[40px] text-sm text-gray-400 mb-1">Short ema</label>

        <input
                        style={{ backgroundColor: '#1e1b2e	' }} 

          className="w-full h-[40px]  p-2 bg-slate-800 rounded border border-slate-700"
          type="number"
          placeholder="Short EMA"
          value={shortEMA}
          onChange={e => setShortEMA(Number(e.target.value))}
        />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block h-[40px] text-sm text-gray-400 mb-1">Long ema</label>

        <input
                        style={{ backgroundColor: '#1e1b2e	' }} 

          className="w-full h-[40px]  p-2 bg-slate-800 rounded border border-slate-700"
          type="number"
          placeholder="Long EMA"
          value={longEMA}
          onChange={e => setLongEMA(Number(e.target.value))}
        />
        </div>


        <div className="flex-1 min-w-[120px]">

                  <label className="block h-[40px] text-sm text-gray-400 mb-1">Start time</label>

        <input
        style={{ backgroundColor: '#1e1b2e	' }} 
          className="p-2 w-full  rounded border border-slate-700"
           type="datetime-local"
          placeholder="start time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          
        /></div>
<div className="flex-1 min-w-[120px]">

                  <label className="block h-[40px] text-sm text-gray-400 mb-1">End time</label>

        <input
        style={{ backgroundColor: '#1e1b2e	' }} 
          className="p-2 w-full  rounded border border-slate-700"
    type="datetime-local"
          placeholder="start time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          
        /></div>









                <div className="flex-1 min-w-[120px] flex items-end">
        <button
          className="bg-blue-600 h-[40px]  px-4 py-2 rounded hover:bg-blue-500 disabled:bg-blue-800 flex items-center"
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
        <Chart options={options} series={series} type="candlestick" height={350} />
      ) : (
        <div className="bg-slate-800 p-8 rounded-lg text-center">
          <p>No data available. Try adjusting your parameters.</p>
        </div>
      )}
    </div>
  );
};

export default EMAChart;