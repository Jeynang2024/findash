import React, { useState, useEffect } from "react";
import "../styles/home.css";

export default function Home() {
  const [ticker, setTicker] = useState({});
  const [rates, setRates] = useState({});

  useEffect(() => {
    // Binance WebSocket: price, change, high, low
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker");
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setTicker({
        price: parseFloat(d.c).toFixed(2),
        change: parseFloat(d.P).toFixed(2),
        high: parseFloat(d.h).toFixed(2),
        low: parseFloat(d.l).toFixed(2),
      });
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    // Poll CoinDesk for conversion rates
   const fetchRates = async () => {
  try {
    const res = await fetch("http://localhost:5001/api/btc-rates");
    const text = await res.text();

    if (!res.ok) {
      console.error("Server error:", text);
      return;
    }

    const data = JSON.parse(text); // data = { USD: 12345.67, EUR: 11234.56, GBP: 9876.54 }

    setRates({
      USD: data.USD,
      EUR: data.EUR,
      GBP: data.GBP,
    });

  } catch (err) {
    console.error("Fetch error:", err);
  }
};

    fetchRates();
    const id = setInterval(fetchRates, 3000);
    return () => clearInterval(id);
  }, []);

  return (

    <div>
      <div className="cover gradient-border">
  <div className="home-container main_cover" style={{backgroundColor: "rgba(73, 56, 97, 0.3)"}}>
     <div className="list">
      <div className="item">
        <img src="./src/images/bitcoin.avif" alt="hidden love"/>
        <div className="content">
          <div className="title text-gradient">TRADE LIVE</div>
          <div className="releasedate">Test Your Edge</div>
          <div className="about">Real-time charts and powerful backtesting tools — all in one platform.</div>
         
        </div>
      </div>
      </div>
        
  </div>
</div>
    <div className="home-container" style={{backgroundColor: "rgba(73, 56, 97, 0.3)"}}>
      
      <h2 className="gradient-text">Live Bitcoin Dashboard</h2>

      <div className="tables ">
          <div className="table-container">

        <table className="home-table">
          <thead>
            <tr><th colSpan="4">BTC / USDT</th></tr>
            <tr><th>Price</th><th>24h Change %</th><th>High</th><th>Low</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${ticker.price || '—'}</td>
              <td className={ticker.change >= 0 ? "positive" : "negative"}>
                {ticker.change || '—'}%
              </td>
              <td>${ticker.high || '—'}</td>
              <td>${ticker.low || '—'}</td>
            </tr>
          </tbody>
        </table>

        <table className="home-table mt-4">
          <thead>
            <tr><th>Currency</th><th>BTC Rate</th></tr>
          </thead>
          <tbody>
            {["USD", "EUR", "GBP"].map(cur => (
              <tr key={cur}>
                <td>{cur}</td>
                <td>{rates[cur] || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
    </div>
  );
}
