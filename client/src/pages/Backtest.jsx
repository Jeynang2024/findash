import React, { useState ,useEffect} from 'react';
import "../styles/header.css";
import { FiSettings } from 'react-icons/fi';
import SMAChart from '../components/buy_sell_sma';
import EMAChart from '../components/Ema_backtest';
import News from '../components/McadBt';
import RSIChart from '../components/Rsi_backtest';
import LiveTrading from "../components/LiveTrading_backtest"
const IndicatorDashboard = () => {
  const [indicator, setIndicator] = useState('SMA');
  const [symbol, setSymbol] = useState('BTCUSDT');

 useEffect(()=>{
    const token=localStorage.getItem("token");
    if(!token){
      navigate("/login", { replace: true });
      return;
    }}
  ,[])
  const renderChart = () => {
    switch (indicator) {
      case 'SMA':
        return <SMAChart symbol={symbol} />;
      case 'EMA':
        return <EMAChart symbol={symbol} />;
      case 'MACD':
        return (
          <News
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
    <div className="min-h-screen  text-gray-200 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center text-gradient">
          <FiSettings className="mr-2" /> Indicator Dashboard
        </h1>
      </header>

      <div className=" p-6 rounded-lg shadow-lg gradient-border mx-auto">
        <div className="grid grid-cols-1">
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">Select Indicator</label>
      <select
              style={{ backgroundColor: '#1e1b2e	' }} 

        value={indicator}
        onChange={(e) => setIndicator(e.target.value)}
        className="w-full p-2 bg-gray-900 border border-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="SMA">Simple Moving Average (SMA)</option>
        <option value="EMA">Exponential Moving Average (EMA)</option>
        <option value="MACD">MACD</option>
        <option value="RSI">RSI</option>
      </select>
    </div>

  </div>
  </div>
<div className="mt-6 ">{indicator && renderChart()}</div>
    <LiveTrading/>
    </div>
  );
};

export default IndicatorDashboard;
