import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PriceTable from '../components/PriceTable';
import useBinanceWebSocket from './useWebSocket';
import '../styles/home.css';
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

  // WebSocket connections for all three pairs
   useEffect(() => {
  const fetchData = async () => {
    try {
      const responses = await Promise.all(
        symbols.map(symbol =>
          axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
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
  const interval = setInterval(fetchData, 1000); // poll every 5 seconds (reduce frequency for 8 coins)
  return () => clearInterval(interval);
}, []);


  // Merge initial data structure with live updates
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
   <div className="flex h-[70vh] bg-gray-950 text-white">
  {/* Left Sidebar */}
  <div className="w-full p-3 overflow-y-auto bg-gray-900/60 backdrop-blur-md border-r border-gray-700">
    
    <PriceTable prices={display} />
  </div>

  

</div>

  );
}

export default Dashboard;