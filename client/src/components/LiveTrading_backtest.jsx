import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/header.css"

 const authRequest = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Handle missing token (redirect to login)
    window.location.href = '/login';
    throw new Error('No authentication token found');
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};
export default function livetrading() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [qty, setQty] = useState('0.001');
  const [side, setSide] = useState('BUY');
  const [status, setStatus] = useState('');
  const [trades, setTrades] = useState([]);
  const [profit, setProfit] = useState(null);
    const [isLoadingTrades, setIsLoadingTrades] = useState(false);

const [error,setError]=useState("");
  const BE = "http://localhost:5001";
  

 

  const fetchTrades = async () => {
        setIsLoadingTrades(true);
    setError("");
try {
      const response = await axios.get(`${BE}/trades`, authRequest());
      setTrades(Array.isArray(response.data?.trades) ? response.data.trades : []);
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError(`Failed to load trades: ${err.response?.data?.error || err.message}`);
      setTrades([]);
    } finally {
      setIsLoadingTrades(false);
    }
  };
  useEffect(() => {
  fetchTrades();
}, []);

const placeOrder = async () => {
  setError(null);
  setStatus('Placing order...');
  
  try {
    const quantity = parseFloat(qty);
    if (!quantity || quantity <= 0) {
      throw new Error('Invalid quantity');
    }

    // Send order request to our backend
    const response = await axios.post(`${BE}/order`, {
      symbol,
      side,
      quantity
    }, authRequest());

    // Update UI with the response
    setStatus(`Order placed successfully. ID: ${response.data.orderId}`);
    fetchTrades(); // Refresh trades list
    
    // Optional: Update local state with the new trade
    setTrades(prev => [{
      symbol,
      side,
      price: response.data.price,
      quantity: response.data.quantity,
      created_at: new Date().toISOString()
    }, ...prev]);

  } catch (err) {
    console.error('Order error:', err);
    setError(`Order failed: ${err.response?.data?.error || err.message}`);
    setStatus('Order failed');
  }
};
  const computeProfit = async () => {
    const { data } = await axios.get(`${BE}/profit/${symbol}`, authRequest());
    setProfit(data);
  };

  return (
   <div className=" p-6  rounded-md shadow-md">
     <h1 className='text-gradient'>Live Trade</h1>
      <div className="flex flex-wrap gap-3  mb-4">
        <input
          className="flex-1 p-2 border rounded"
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          placeholder="Symbol (e.g. BTCUSDT)"
        />
        <input
          className="w-24 p-2 border rounded"
          type="number"
          step="any"
          value={qty}
          onChange={e => setQty(e.target.value)}
          placeholder="Quantity"
        />
        <select
          className="p-2 border rounded"
          value={side}
          onChange={e => setSide(e.target.value)}>
          <option>BUY</option>
          <option>SELL</option>
        </select>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={placeOrder}>
          Place Order
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={computeProfit}>
          Show Profit
        </button>
      </div>

      {status && (
        <div className="mb-4 text-gray-800 font-medium">{status}</div>
      )}

      {profit && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p className="text-lg font-semibold text-gray-700">
            Profit for {profit.symbol}:
          </p>
          <p className="text-xl font-bold text-gray-900">
            {profit.profit.toFixed(4)}
          </p>
          <p className="text-sm text-gray-600">
            Open quantity: {profit.openQty}
          </p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Your Trades:</h3>
        <ul className="divide-y divide-gray-200">
          {trades.map(t => (
            <li key={t.id} className="py-2 flex justify-between text-white">
              <span>
                <strong className="capitalize">{t.side}</strong> {t.quantity}@{t.price}
              </span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}


