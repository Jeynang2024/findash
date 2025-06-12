import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PriceTable from '../components/PriceTable';
import useBinanceWebSocket from './useWebSocket';
import '../styles/home.css';
function Dashboard() {
  const [prices, setPrices] = useState([]);
  const [liveData, setLiveData] = useState({});
  
  // WebSocket connections for all three pairs
  const btcWs = useBinanceWebSocket('btcusdt@ticker');
  const ethWs = useBinanceWebSocket('ethusdt@ticker');
  const dogeWs = useBinanceWebSocket('dogeusdt@ticker');
useEffect(() => {
  const fetchData = async () => {
    try {
      const responses = await Promise.all([
        axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'),
        axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT'),
        axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=DOGEUSDT')
      ]);

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

  fetchData(); // initial
  const interval = setInterval(fetchData, 1000); // every 30 seconds
  return () => clearInterval(interval);
}, []);

  // Initial snapshot from Binance REST API
 /* useEffect(() => {
    (async () => {
      try {
        const responses = await Promise.all([
          axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'),
          axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT'),
          axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=DOGEUSDT')
        ]);
        
        const initialPrices = responses.map(r => ({
          pair: r.data.symbol,
          price: parseFloat(r.data.lastPrice),
          change: parseFloat(r.data.priceChangePercent).toFixed(2)
        }));
        
        setPrices(initialPrices);
        
        // Initialize liveData with initial values
        const initialLiveData = {};
        initialPrices.forEach(p => {
          initialLiveData[p.pair] = {
            price: p.price,
            change: p.change
          };
        });
        setLiveData(initialLiveData);
      } catch (err) {
        console.error('Snapshot error', err);
      }
    })();
  }, []);

  // Handle live updates from all WebSockets
  useEffect(() => {
    const updateData = (lastMessage) => {
      console.log("BTC lastMessage:", btcWs.lastMessage);
  console.log("ETH lastMessage:", ethWs.lastMessage);
  console.log("DOGE lastMessage:", dogeWs.lastMessage);
      if (lastMessage?.s && lastMessage?.c && lastMessage?.P) {
        const pair = lastMessage.s;
        const price = parseFloat(lastMessage.c);
        const change = parseFloat(lastMessage.P).toFixed(2);
        
        setLiveData(prev => ({
          ...prev,
          [pair]: {
            price,
            change
          }
        }));
      }
    };

    updateData(btcWs.lastMessage);
    updateData(ethWs.lastMessage);
    updateData(dogeWs.lastMessage);
  }, [btcWs.lastMessage, ethWs.lastMessage, dogeWs.lastMessage]);
*/
  // Merge initial data structure with live updates
  const display = prices.map(p => {
    const live = liveData[p.pair] || {};
    return {
      pair: p.pair,
      price: live.price !== undefined ? live.price : p.price,
      change: live.change !== undefined ? live.change : p.change
    };
  });

  // Get connection status
  const connectionStatus = [btcWs.status, ethWs.status, dogeWs.status].includes('disconnected') 
    ? 'disconnected' 
    : 'connected';

  return (
   <div className="flex h-screen bg-gray-950 text-white">
  {/* Left Sidebar */}
  <div className="w-1/4 p-4 overflow-y-auto bg-gray-900/60 backdrop-blur-md border-r border-gray-700">
    <h2 className="text-2xl font-bold mb-4  gradient-text">
      Crypto Rates — WS: {connectionStatus}
    </h2>
    <PriceTable prices={display} />
  </div>

  {/* Center Section (empty for now) */}
  <div className="flex-1 p-8 flex items-center justify-center">
    {/* Placeholder for future LiveChart or other components */}
    <div className="text-gray-400 italic">Add chart or dashboard content here</div>
  </div>
</div>

  );
}

export default Dashboard;