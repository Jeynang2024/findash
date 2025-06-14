import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import { getCandles } from "../components/binanceRestClient";
import { calculateEMA, calculateMACD, calculateRSI, calculateSMA } from "../components/calculations";

import BaseCandleChart from "../components/BaseCandleChart";
import SMAChart from "../components/SMAChart";
import EMAChart from "../components/EMAChart";
import RSIChart from "../components/RSIChart";
import MACDChart from "../components/MACDChart";

function CoinChart({ initialSymbol = "BTCUSDT", initialInterval = "1h", start, end }) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [interval, setInterval] = useState(initialInterval);
  const [rawData, setRawData] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState("none");
  const [indicatorPeriod, setIndicatorPeriod] = useState(14);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const candles = await getCandles({ symbol, interval, startTime: start, endTime: end, limit: 500 });
      setRawData(candles);
    } catch (error) {
      console.error("Error fetching candle data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [symbol, interval, start, end]);

  const renderChart = () => {
    switch (selectedIndicator) {
      case "sma":
        return <SMAChart rawData={rawData} calculateSMA={calculateSMA} period={indicatorPeriod} />;
      case "ema":
        return <EMAChart rawData={rawData} calculateEMA={calculateEMA} period={indicatorPeriod} />;
      case "rsi":
        return <RSIChart rawData={rawData} calculateRSI={calculateRSI} period={indicatorPeriod} />;
      case "macd":
        return <MACDChart rawData={rawData} calculateMACD={calculateMACD} />;
     /* default:
        return <BaseCandleChart data={[{
          name: symbol,
          type: "candlestick",
          data: rawData.map(c => ({
            x: new Date(c.time),
            y: [parseFloat(c.open), parseFloat(c.high), parseFloat(c.low), parseFloat(c.close)]
          }))
        }]} options={{
          chart: { type: "candlestick", background: "#1e293b" },
          xaxis: { type: "datetime", labels: { style: { colors: "#94A3B8" } } },
          yaxis: [{ title: { text: "Price" }, labels: { style: { colors: "#94A3B8" } } }]
        }} />;*/
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4 bg-slate-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">Market Prices</h2>
          <Dashboard />
        </div>
        <div className="w-full lg:w-3/4 bg-slate-800 rounded-lg p-4">
          <div className="flex flex-wrap gap-3 mb-6">
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="p-2 bg-slate-700 rounded text-slate-100" />
            <input type="text" value={interval} onChange={(e) => setInterval(e.target.value)} className="p-2 bg-slate-700 rounded text-slate-100" />
            <select value={selectedIndicator} onChange={(e) => setSelectedIndicator(e.target.value)} className="p-2 bg-slate-700 rounded text-slate-100">
              <option value="none">No Indicator</option>
              <option value="sma">SMA</option>
              <option value="ema">EMA</option>
              <option value="rsi">RSI</option>
              <option value="macd">MACD</option>
            </select>
            {selectedIndicator !== "macd" && selectedIndicator !== "none" && (
              <input type="number" value={indicatorPeriod} onChange={(e) => setIndicatorPeriod(parseInt(e.target.value))} className="p-2 w-20 bg-slate-700 rounded text-slate-100" />
            )}
            <button onClick={fetchData} className="bg-emerald-600 px-4 py-2 rounded text-white">{loading ? "Loading..." : "Refresh"}</button>
          </div>

          {/* Chart Rendered Here */}
          <BaseCandleChart data={[{
          name: symbol,
          type: "candlestick",
          data: rawData.map(c => ({
            x: new Date(c.time),
            y: [parseFloat(c.open), parseFloat(c.high), parseFloat(c.low), parseFloat(c.close)]
          }))
        }]} options={ {
  chart: {
    type: "candlestick",
    background: "#1e293b",
    toolbar: { show: true }
  },
  xaxis: {
    type: "datetime",
    labels: {
      style: {
        colors: "#94A3B8" // x-axis label color
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: "#94A3B8" // 🌟 <- Y-axis label color (change to your desired hex code)
      }
    },
    title: {
      text: "Price",
      style: {
        color: "#FACC15" // Optional: title color
      }
    }
  },
  tooltip: {
    enabled: true
  }
}
} />
          {rawData.length ? renderChart() : (
            <div className="p-8 bg-slate-700 rounded-lg text-center">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoinChart;
