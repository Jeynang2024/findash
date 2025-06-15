import React, { useState } from 'react';
import { FiSettings } from 'react-icons/fi';
import SMAChart from '../components/buy_sell_sma';
import EMAChart from '../components/Ema_backtest';
import MACDChart from '../components/Mcad_backtest';
import RSIChart from '../components/Rsi_backtest';

const IndicatorDashboard = () => {
const [indicator, setIndicator] = useState('SMA');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');

 

  const renderChart = () => {
    switch (indicator) {
      case 'SMA':
        return <SMAChart symbol={symbol} />;
      case 'EMA':
        return <EMAChart symbol={symbol} />;
      case 'MACD':
        return (
          <MACDChart
            symbol={symbol}
     
          />
        );
      case 'RSI':
        return <RSIChart symbol={symbol}  />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FiSettings className="mr-2" /> Indicator Dashboard
        </h1>
      </header>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">Indicator</label>
            <select
              value={indicator}
              onChange={(e) => {
                setIndicator(e.target.value);
              }}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
            >
              <option value="SMA">SMA</option>
              <option value="EMA">EMA</option>
              <option value="MACD">MACD</option>
              <option value="RSI">RSI</option>
            </select>
          </div>

         

         
        </div>

        {/* Dynamic parameter inputs */}
      </div>

      {/* Chart Rendered Below */}
<div className="mt-6">{indicator && renderChart()}</div>
    </div>
  );
};

export default IndicatorDashboard;
