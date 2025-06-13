import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { getCandles } from "../components/binanceRestClient";
import Dashboard from "./Dashboard";
import { calculateEMA,calculateMACD,calculateRSI,calculateSMA } from "../components/calculations";


function CoinChart({ initialSymbol = "BTCUSDT", initialInterval = "1h", start, end }) {
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({ 

   chart: {
      height: 550,
      type: "candlestick",
      animations: { enabled: false },
        zoom: { enabled: true },
      toolbar: { show: true },

    },
   
    xaxis: { 
         type: 'datetime',
         crosshairs: {
    show: false,
  },tooltip:{enabled: true, }, // important for dark UIs
      labels: { style: { colors: '#94A3B8' } },
      axisBorder: { color: '#334155' },
      axisTicks: { color: '#334155' } },
    yaxis: [
      {
        seriesName: initialSymbol,
        labels: { style: { colors: '#94A3B8' } },

        tooltip: { enabled: true ,
       theme: 'dark', // important for dark UIs

        },
        title: { text: "Price" ,  style: {
        color: '#FACC15', // <-- Change this to your desired color
        fontSize: '14px',
        fontWeight: 'bold'
      }},
      },
      {
        seriesName: "MACD Line",
        opposite: true,
        labels: { formatter: (val) => val.toFixed(2) ,style: { colors: '#94A3B8' }},
        title: { text: "MACD" },
      },
    ],
    plotOptions: {
      candlestick: {
        colors: { upward: "#00B746", downward: "#EF403C" },
      },wick: {
          useFillColor: true
        }

    },
  });
  

  const [symbol, setSymbol] = useState(initialSymbol);
  const [interval, setInterval] = useState(initialInterval);
  const [loading, setLoading] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState("none");
  const [indicatorPeriod, setIndicatorPeriod] = useState(14);
  const [rawData, setRawData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const candles = await getCandles({ 
        symbol, 
        interval, 
        startTime: start, 
        endTime: end, 
        limit: 500 
      });
      
      setRawData(candles);
      
      const candleSeries = [{
        name: symbol,
        type: 'candlestick',
        data: candles.map(candle => ({
          x: new Date(candle.time),
          y: [
            parseFloat(candle.open),
            parseFloat(candle.high),
            parseFloat(candle.low),
            parseFloat(candle.close)
          ]
        }))
      }];
      
      setSeries(candleSeries);
      setOptions(prev => ({
        ...prev,
        title: { text: `${symbol} / ${initialInterval}` }
      }));
      
    } catch (error) {
      console.error("Error fetching candle data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyIndicator = () => {
    if (selectedIndicator === "none" || rawData.length === 0) {
      setSeries([series[0]]);
      return;
    }

    const baseSeries = series[0];
    let indicatorSeries = [];

    switch(selectedIndicator) {
      case "sma":
        indicatorSeries = {
          name: `SMA ${indicatorPeriod}`,
          type: 'line',
          data: calculateSMA(rawData, indicatorPeriod)
        };
        break;
      case "ema":
        indicatorSeries = {
          name: `EMA ${indicatorPeriod}`,
          type: 'line',
          data: calculateEMA(rawData, indicatorPeriod)
        };
        break;
      case "rsi":
        indicatorSeries = {
          name: `RSI ${indicatorPeriod}`,
          type: 'line',
          data: calculateRSI(rawData, indicatorPeriod)
        };
        // Add RSI-specific yaxis configuration
        setOptions(prev => ({
          ...prev,
          yaxis: [
            { ...prev.yaxis, tooltip: { enabled: true } },
            {
              seriesName: `RSI ${indicatorPeriod}`,
              opposite: true,
              min: 0,
              max: 100,
              tooltip: { enabled: true }
            }
          ]
        }));
        break;
      case "macd":
       const { macdLine, signalLine, histogram } = calculateMACD(rawData);
      
      return setSeries([
        baseSeries,
       { name: 'MACD Line', type: 'line', data: macdLine, yAxisIndex: 1 },
        { name: 'Signal Line', type: 'line', data: signalLine, yAxisIndex: 1 },
        { name: 'Histogram', type: 'column', data: histogram, yAxisIndex: 1 }
     
        ]);
      default:
        break;
    }

    setSeries([baseSeries, indicatorSeries]);
  };

  useEffect(() => {
    fetchData();
  }, [symbol, interval, start, end]);

  useEffect(() => {
    if (rawData.length > 0) {
      applyIndicator();
    }
  }, [selectedIndicator, indicatorPeriod]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4 bg-slate-800 rounded-lg p-4">
  <h2 className="text-lg font-semibold mb-4 text-emerald-400">Market Prices</h2>
   <Dashboard />
          </div>
                  <div className="w-full lg:w-3/4 bg-slate-800 rounded-lg p-4">
          {/* Chart Controls */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol (e.g., BTCUSDT)"
              className="p-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <input
              type="text"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              placeholder="Interval (e.g., 1h)"
              className="p-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              className="p-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="none">No Indicator</option>
              <option value="sma">SMA</option>
              <option value="ema">EMA</option>
              <option value="rsi">RSI</option>
              <option value="macd">MACD</option>
            </select>
            
            {selectedIndicator !== "none" && selectedIndicator !== "macd" && (
              <input
                type="number"
                value={indicatorPeriod}
                onChange={(e) => setIndicatorPeriod(parseInt(e.target.value))}
                min="1"
                max="100"
                className="p-2 bg-slate-700 border border-slate-600 rounded text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-20"
              />
            )}
            
            <button
              onClick={fetchData}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : "Refresh"}
            </button>
          </div>
          
          {/* Chart Title */}
          <h2 className="text-xl font-bold mb-4 text-slate-100">
            {symbol} - {interval} Chart
            <span className="ml-2 text-sm font-normal text-slate-400">
              {selectedIndicator !== "none" && `(${selectedIndicator.toUpperCase()}${selectedIndicator !== "macd" ? ` ${indicatorPeriod}` : ''})`}
            </span>
          </h2>
          
          {/* Chart Display */}
          {series.length > 0 ? (
            <div className="bg-slate-800 p-2 rounded">
              <Chart 
                options={options} 
                series={series} 
                type="candlestick"
                height={500} 
                width="100%" 
              />
            </div>
          ) : (
            <div className="p-8 bg-slate-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-300">
                  {loading ? "Loading chart data..." : "No chart data available"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {loading ? "Please wait while we fetch the data" : "Select a symbol and interval to view the chart"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>


   
   
  );
}

export default CoinChart;