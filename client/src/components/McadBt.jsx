import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

const toUnixTimestamp = (datetimeStr) => new Date(datetimeStr).getTime();
const IST_OFFSET = 5.5 * 60 * 60 * 1000;

const fetchKlines = async (symbol = 'BTCUSDT', interval = '1h', limit = 500, startTime, endTime) => {
  const params = new URLSearchParams({ symbol, interval, limit });

  if (startTime) {
    const startUTC = toUnixTimestamp(startTime) - IST_OFFSET;
    params.append('startTime', startUTC);
  }

  if (endTime) {
    const endUTC = toUnixTimestamp(endTime) - IST_OFFSET;
    params.append('endTime', endUTC);
  }

  const res = await fetch(`https://api.binance.com/api/v3/klines?${params}`);
  const data = await res.json();

  return data.map(c => ({
    time: c[0] + IST_OFFSET,
    close: parseFloat(c[4])
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

const calculateMACD = (closes, timestamps, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  if (!closes || closes.length < slowPeriod + signalPeriod) {
    return { macd: [], signal: [], histogram: [], timestamps: [] };
  }

  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  const offset = fastEMA.length - slowEMA.length;

  if (offset < 0) {
    return { macd: [], signal: [], histogram: [], timestamps: [] };
  }

  const alignedFastEMA = fastEMA.slice(offset);
  const macd = alignedFastEMA.map((val, i) => val - slowEMA[i]);

  const signal = calculateEMA(macd, signalPeriod);
  const histogram = macd.slice(signalPeriod - 1).map((val, i) => val - signal[i]);
  const alignedTimestamps = timestamps.slice(timestamps.length - histogram.length);

  return {
    macd: macd.slice(signalPeriod - 1),
    signal,
    histogram,
    timestamps: alignedTimestamps
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
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartKey, setChartKey] = useState(0);

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

      const { macd, signal, histogram, timestamps } = calculateMACD(closes, times, fastPeriod, slowPeriod, signalPeriod);

      if (macd.length === 0) {
        setError(`Need at least ${slowPeriod + signalPeriod} data points`);
        return;
      }

      setSeries([
        { name: 'MACD', type: 'line', data: macd.map((y, i) => ({ x: timestamps[i], y })) },
        { name: 'Signal', type: 'line', data: signal.map((y, i) => ({ x: timestamps[i], y })) },
        { name: 'Histogram', type: 'bar', data: histogram.map((y, i) => ({ x: timestamps[i], y })) }
      ]);

      setChartKey(prev => prev + 1);
    } catch (err) {
      console.error('Error calculating MACD:', err);
      setError('Failed to calculate MACD');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [symbol, interval, fastPeriod, slowPeriod, signalPeriod, startTime, endTime]);

  const options = {
    chart: {
      id: 'macd-chart',
      background: '#1e1b2e',
      foreColor: '#f1f5f9',
      toolbar: { show: true },
    },
      colors: ['#60A5FA', '#10B981', '#EF4444'], // Match series: MACD, Signal, Histogram

    stroke: { width: [2, 2, 0], curve: 'smooth' },
    xaxis: { type: 'datetime' },
    yaxis: { labels: { formatter: val => val.toFixed(4) } },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        colors: {
          ranges: [
            { from: -1000, to: 0, color: '#EF4444' },
            { from: 0, to: 1000, color: '#10B981' }
          ]
        }
      }
    },
    tooltip: { shared: true, intersect: false, theme: 'dark' },
    legend: { position: 'top',
         horizontalAlign: 'left' ,
         markers: {
        fillColors: ['#60A5FA', '#10B981', '#EF4444']
      }
        },
    grid: { borderColor: '#334155' }
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-semibold mb-4">MACD Chart</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        {[['Symbol', symbol, setSymbol], ['Interval', interval, setInterval]].map(([label, value, setter], idx) => (
          <div key={idx} className="flex-1 min-w-[120px]">
            <label className="block text-sm text-gray-400 mb-1">{label}</label>
            <input
              style={{ backgroundColor: '#1e1b2e' }}
              className="w-full p-2 rounded border border-slate-700"
              value={value}
              onChange={e => setter(e.target.value)}
            />
          </div>
        ))}
        {[['Fast Period', fastPeriod, setFastPeriod], ['Slow Period', slowPeriod, setSlowPeriod], ['Signal Period', signalPeriod, setSignalPeriod]].map(([label, value, setter], idx) => (
          <div key={idx} className="flex-1 min-w-[120px]">
            <label className="block text-sm text-gray-400 mb-1">{label}</label>
            <input
              style={{ backgroundColor: '#1e1b2e' }}
              type="number"
              min="1"
              className="w-full p-2 rounded border border-slate-700"
              value={value}
              onChange={e => setter(Math.max(1, +e.target.value))}
            />
          </div>
        ))}
        {[['Start time', startTime, setStartTime], ['End time', endTime, setEndTime]].map(([label, value, setter], idx) => (
          <div key={idx} className="flex-1 min-w-[120px]">
            <label className="block text-sm text-gray-400 mb-1">{label}</label>
            <input
              style={{ backgroundColor: '#1e1b2e' }}
              className="w-full p-2 rounded border border-slate-700"
              type="datetime-local"
              value={value}
              onChange={e => setter(e.target.value)}
            />
          </div>
        ))}
                <div className="flex-1 min-w-[120px] flex items-end">

        <button 
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 disabled:bg-blue-800 flex items-center"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        </div>
      </div>

      {error && <div className="bg-red-900 text-red-100 p-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Chart key={chartKey} options={options} series={series} type="line" height={400} />
      )}
    </div>
  );
};

export default MACDChart;
