import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';


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
    time: c[0] + IST_OFFSET,
    close: parseFloat(c[4]),
  }));
};

const calculateEMA = (data, period) => {
  if (!data || data.length < period) return [];
  
  const k = 2 / (period + 1);
  let ema = [data.slice(0, period).reduce((a, b) => a + b, 0) / period];

  for (let i = period; i < data.length; i++) {
    ema.push(data[i] * k + ema[ema.length - 1] * (1 - k));
  }

  return ema;
};

const calculateMACD = (closes,timestamps, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  if (!closes || closes.length < slowPeriod+signalPeriod) return { macd: [], signal: [], histogram: [] ,timestamps: [] };

  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  
  // Align the EMAs by their lengths
  const offset = slowEMA.length - fastEMA.length;
  const macd = fastEMA.map((val, i) => val - slowEMA[i + offset]);
  
  const signal = calculateEMA(macd, signalPeriod);
  const histogram = macd.map((val, i) => val - (signal[i] || 0));

  return { 
    macd, 
    signal, 
    histogram,
    startIndex: closes.length - macd.length
  };
};

const MACDChart = () => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');
  const [fastPeriod, setFastPeriod] = useState(12);
  const [slowPeriod, setSlowPeriod] = useState(26);
  const [signalPeriod, setSignalPeriod] = useState(9);
const [series, setSeries] = useState([
    { name: 'MACD', type: 'line', data: [] },
    { name: 'Signal', type: 'line', data: [] },
    { name: 'Histogram', type: 'bar', data: [] }
  ]);
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartKey, setChartKey] = useState(0); // Key to force chart re-render

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (startTime && endTime && toUnixTimestamp(startTime) >= toUnixTimestamp(endTime)) {
        setError('End time must be after start time');
        return;
      }
      const raw = await fetchKlines(symbol, interval, 700, startTime, endTime);
      if (raw.length === 0) {
        setError('No data received from API');
        return;
      }

      const closes = raw.map(r => r.close);
      const times = raw.map(r => r.time);

      const { macd, signal, histogram, timestamps } = calculateMACD(
        closes, 
        times,
        fastPeriod, 
        slowPeriod, 
        signalPeriod
      );
 if (macd.length === 0) {
        setError(`Need at least ${slowPeriod + signalPeriod} data points`);
        return;
      }
      //const labels = times.slice(startIndex);

      setSeries([
        {
          name: 'MACD',
          type: 'line',
          data: macd.map((val, i) => ({ x: timestamps[i], y: val })),
        },
        {
          name: 'Signal',
          type: 'line',
          data: signal.map((val, i) => ({ x: timestamps[i], y: val })),
        },
        {
          name: 'Histogram',
          type: 'bar',
          data: histogram.map((val, i) => ({ x: timestamps[i], y: val })),
        },
      ]);
      
      // Force chart re-render when parameters change
      setChartKey(prev => prev + 1);
    } catch (err) {
      console.error('Error calculating MACD:', err);
      setError('Failed to calculate MACD');
    } finally {
      setLoading(false);
    }
  };

  // Reload data when any parameter changes
  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [symbol, interval, fastPeriod, slowPeriod, signalPeriod, startTime, endTime]);
  
  /*useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300); // Small debounce to avoid rapid API calls
    
    return () => clearTimeout(timer);
  }, [symbol, interval, fastPeriod, slowPeriod, signalPeriod,startTime,endTime]);
*/
  const options = {
    chart: {
      id: 'macd-chart',
      type: 'line',
      height: 400,
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
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      },
    },
    stroke: {
      width: [2, 2, 0],
      curve: 'smooth',
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
      labels: {
        style: {
          colors: '#f1f5f9'
        },
        formatter: (val) => val.toFixed(4)
      },
      tooltip: {
        enabled: true
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        colors: {
          ranges: [
            {
              from: -1000,
              to: 0,
              color: '#EF4444'
            },
            {
              from: 0,
              to: 1000,
              color: '#10B981'
            }
          ]
        }
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy HH:mm'
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: {
        colors: '#f1f5f9'
      }
    },
    grid: {
      borderColor: '#334155'
    }
  };

  return (
    <div className="p-4 gradient-border text-white ">
      <h2 className="text-xl font-semibold mb-4 text-gradient">MACD Chart</h2>

      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm text-gray-400 mb-1">Symbol</label>
          <input 
                  style={{ backgroundColor: '#1e1b2e	' }} 

            className="w-full p-2 bg-slate-800 rounded border border-slate-700" 
            value={symbol} 
            onChange={e => setSymbol(e.target.value.toUpperCase())} 
          />
        </div>
        
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm text-gray-400 mb-1">Interval</label>
          <select
                  style={{ backgroundColor: '#1e1b2e	' }} 

            className="w-full p-2 bg-slate-800 rounded border border-slate-700"
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
          <label className="block text-sm text-gray-400 mb-1">Fast Period</label>
          <input 
                  style={{ backgroundColor: '#1e1b2e	' }} 

            type="number" 
            min="1"
            className="w-full p-2 bg-slate-800 rounded border border-slate-700" 
            value={fastPeriod} 
            onChange={e => setFastPeriod(Math.max(1, +e.target.value))} 
          />
        </div>
        
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm text-gray-400 mb-1">Slow Period</label>
          <input 
                  style={{ backgroundColor: '#1e1b2e	' }} 

            type="number" 
            min={fastPeriod + 1}
            className="w-full p-2 bg-slate-800 rounded border border-slate-700" 
            value={slowPeriod} 
            onChange={e => setSlowPeriod(Math.max(fastPeriod + 1, +e.target.value))} 
          />
        </div>
        
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm text-gray-400 mb-1">Signal Period</label>
          <input 
                  style={{ backgroundColor: '#1e1b2e	' }} 

            type="number" 
            min="1"
            className="w-full p-2 bg-slate-800 rounded border border-slate-700" 
            value={signalPeriod} 
            onChange={e => setSignalPeriod(Math.max(1, +e.target.value))} 
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
        
        <button 
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 disabled:bg-blue-800 flex items-center"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900 text-red-100 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : series.length > 0 ? (
        <Chart 
          key={chartKey} // Force re-render when params change
          options={options} 
          series={series} 
          type="line" 
          height={400} 
        />
      ) : (
        <div className="bg-slate-800 p-8 rounded-lg text-center">
          <p>No data available. Try adjusting your parameters.</p>
        </div>
      )}
    </div>
  );
};

export default MACDChart;