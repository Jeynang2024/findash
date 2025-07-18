import React, { useState, useEffect,memo } from 'react';
import axios from 'axios';
import PriceTable from '../components/PriceTable';
import useBinanceWebSocket from './useWebSocket';
import '../styles/home.css';
const BE = import.meta.env.VITE_BE;

function Dashboard() {
  const [prices, setPrices] = useState([]);
  const [liveData, setLiveData] = useState({});
const symbols = [
  'BTCUSDT',
  'ETHUSDT',
  'DOGEUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'SOLUSDT',
  'ADAUSDT',
  'TRXUSDT',
  'AVAXUSDT',
  
  'SHIBUSDT',
  'DOTUSDT',
  'LTCUSDT'
];

   useEffect(() => {
  const fetchData = async () => {
    try {
      const responses = await Promise.all(
        symbols.map(symbol =>
          axios.get(`${BE}/api/binance/ticker?symbol=${symbol}`)
        )
      );

      const newPrices = responses.map(r => ({
        pair: r.data.symbol,
        price: parseFloat(r.data.lastPrice),
        change: parseFloat(r.data.priceChangePercent).toFixed(2)
      }));

      setPrices(newPrices);
    } catch (err) {
      console.error('Polling error', err);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 1000); 
  return () => clearInterval(interval);
}, []);


  const display = prices.map(p => {
    const live = liveData[p.pair] || {};
    return {
      pair: p.pair,
      price: live.price !== undefined ? live.price : p.price,
      change: live.change !== undefined ? live.change : p.change
    };
  });
const wsConnections = symbols.map(s => useBinanceWebSocket(`${s.toLowerCase()}@ticker`));
const connectionStatus = wsConnections.some(ws => ws.status === 'disconnected')
  ? 'disconnected'
  : 'connected';

 
  return (
   <div className="flex h-[70vh]  text-white">
  <div className="w-full p-3 overflow-y-auto  backdrop-blur-md border-r border-gray-700">
    
    <PriceTable prices={display} />
  </div>

  

</div>

  );
}

export default memo(Dashboard);