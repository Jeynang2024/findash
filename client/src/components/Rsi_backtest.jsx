import React, { useEffect, useState,useRef } from 'react';
import Chart from 'react-apexcharts';
import "../styles/header.css";

const toUnixTimestamp = (datetimeStr) => new Date(datetimeStr).getTime();

const IST_OFFSET = 5.5 * 60 * 60 * 1000;  // 5 hours 30 minutes = 19800000 ms

const fetchKlines = async (symbol = 'BTCUSDT', interval = '1h', limit = 500,startTime,endTime) => {
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

  //const url = `https://api.binance.com/api/v3/klines?${params}`;
  const res = await fetch(`https://api.binance.com/api/v3/klines?${params}`);
  const data = await res.json();
  return data.map(c => ({
    x: c[0] + IST_OFFSET,
    close: parseFloat(c[4]),
  }));
};




const calculateRSI = (closes, period) => {
  if (!closes || closes.length <= period) {
    alert(`Need at least ${period + 1} data points to calculate RSI, got ${closes.length}`);
    console.error('Not enough data to calculate RSI');
    return [];
  }
  const rsi = [];
  let prevAvgGain = 0;
  let prevAvgLoss = 0;

  // Calculate initial averages
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i].close - closes[i - 1].close;
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  prevAvgGain = gains / period;
  prevAvgLoss = losses / period;

  // First RSI value
  const rs = prevAvgGain / (prevAvgLoss || 1);
  rsi.push({ x: closes[period].x, y: 100 - 100 / (1 + rs) });

  // Subsequent RSI values
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i].close - closes[i - 1].close;
    let currentGain = 0;
    let currentLoss = 0;

    if (diff > 0) currentGain = diff;
    else currentLoss = -diff;

    // Smooth averages
    prevAvgGain = (prevAvgGain * (period - 1) + currentGain) / period;
    prevAvgLoss = (prevAvgLoss * (period - 1) + currentLoss) / period;

    const rs = prevAvgGain / (prevAvgLoss || 1);
    rsi.push({ x: closes[i].x, y: 100 - 100 / (1 + rs) });
  }

  return rsi;
};

const RSIChart = () => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');
  const [period, setPeriod] = useState(14);
  const [overbought, setOverbought] = useState(70);
  const [oversold, setOversold] = useState(30);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const raw = await fetchKlines(symbol, interval, 1000, startTime, endTime);
    //console.log('Fetched data:', raw);  // Verify structure
    
    if (raw.length <= period) {
      console.error(`Need at least ${period+1} data points, got ${raw.length}`);
      return;
    }

      //const raw = await fetchKlines(symbol, interval);
      const rsi = calculateRSI(raw, period);
      //console.log('Calculated RSI:', rsi);  // Verify RSI calculation
      setData(rsi);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [interval, symbol, period, overbought, oversold,startTime,endTime]);

  const options = {
    chart: {
      type: 'line',
      height: 350,
      background: '#1e1b2e',
      foreColor: '#f1f5f9',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    stroke: { 
      curve: 'smooth', 
      width: 2 
    },
    xaxis: { 
      type: 'datetime',
      labels: {
        style: {
          colors: '#f1f5f9'
        }
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        style: {
          colors: '#f1f5f9'
        }
      },
      crosshairs: {
        show: true,
        position: 'back',
        stroke: {
          color: '#64748b',
          width: 1,
          dashArray: 0
        }
      }
    },
    grid: {
      borderColor: '#334155'
    },
    annotations: {
      yaxis: [
        {
          y: overbought,
          borderColor: '#EF4444',
          strokeDashArray: 4,
          label: { 
            text: 'Overbought', 
            style: { 
              color: '#fff', 
              background: '#EF4444',
              fontSize: '12px'
            } 
          },
        },
        {
          y: oversold,
          borderColor: '#3B82F6',
          strokeDashArray: 4,
          label: { 
            text: 'Oversold', 
            style: { 
              color: '#fff', 
              background: '#3B82F6',
              fontSize: '12px'
            } 
          },
        },
      ],
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy HH:mm'
      }
    }
  };

  const series = [{ 
    name: 'RSI', 
    data: data,
    color: '#818cf8'
  }];

  return (
    <div className="p-4  gradient-border text-white ">
      <h2 className="text-xl font-semibold mb-4 text-gradient">RSI Chart</h2>

      <div className="flex flex-wrap gap-4 mb-4">
         <div className="flex-1 min-w-[120px]">

          <label className="block h-[40px] text-sm text-gray-400 mb-1">Symbol</label>

        <input
                style={{ backgroundColor: '#1e1b2e	' }} 

          className="p-2 w-full bg-slate-800 rounded border border-slate-700"
          placeholder="Symbol (e.g. BTCUSDT)"
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
        /></div>
        <div className="flex-1 min-w-[120px]">

          <label className="block h-[40px] text-sm text-gray-400 mb-1">Interval</label>

        <select 
                style={{ backgroundColor: '#1e1b2e	' }} 

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

          <label className="block h-[40px] text-sm text-gray-400 mb-1">Rsi Period</label>

        <input 
                style={{ backgroundColor: '#1e1b2e	' }} 

          type="number" 
          className="p-2 w-full bg-slate-800 rounded border border-slate-700 w-24"
          value={period} 
          onChange={e => setPeriod(+e.target.value)} 
          placeholder="RSI Period" 
        />
        </div>
        <div className="flex-1 min-w-[120px]">

          <label className="block h-[40px] text-sm text-gray-400 mb-1">Overbrought</label>

        <input 
                style={{ backgroundColor: '#1e1b2e	' }} 

          type="number" 
          className="p-2 w-full bg-slate-800 rounded border border-slate-700 w-32"
          value={overbought} 
          onChange={e => setOverbought(+e.target.value)} 
          placeholder="Overbought" 
        />
        </div>
        <div className="flex-1 min-w-[120px]">

          <label className="block h-[40px] text-sm text-gray-400 mb-1">Oversold</label>

        <input 
                        style={{ backgroundColor: '#1e1b2e	' }} 

          type="number" 
          className="p-2 w-full bg-slate-800 rounded border border-slate-700 w-32"
          value={oversold} 
          onChange={e => setOversold(+e.target.value)} 
          placeholder="Oversold" 
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
          placeholder="end time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          
        /></div>

        <div className="flex-1 min-w-[120px] flex items-end">
        <button 
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 disabled:bg-blue-800"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Chart 
          options={options} 
          series={series} 
          type="line" 
          height={350} 
        />
      )}
    </div>
  );
};

export default RSIChart;