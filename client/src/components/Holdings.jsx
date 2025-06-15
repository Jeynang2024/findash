import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import '../styles/holdings.css'; // Import your custom styles
const HoldingsChart = ({ onBalancesUpdate }) => {
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    const fetchBalances = async () => {
      const res = await fetch('http://localhost:5001/account');
      if(!res.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
 // Return empty array instead of failing
      }
      const data = await res.json();
      console.log('Fetched account data:', data);
      if (!Array.isArray(data)) {
      console.error('Expected array but got:', data);
      return [];
    }
     const filtered = data
  .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
  .map(b => ({ asset: b.asset, amount: parseFloat(b.free) }))
  .sort((a, b) => b.amount - a.amount)   // Sort descending
  .slice(0, 20);                         // ✅ Take top 50

setBalances(filtered);
if (onBalancesUpdate) {
        onBalancesUpdate(data);
      }

    };
    fetchBalances();
  }, []);

 const chartOptions = {
  chart: {
    type: 'bar',
    foreColor: '#CBD5E1',
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false
      },
      export: {
        csv: { filename: 'holdings-data' },
        svg: { filename: 'holdings-chart' },
        png: { filename: 'holdings-chart' }
      }
    },
    // Force dark theme
    background: '#0F172A',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  // ... rest of your existing options
  theme: {
    mode: 'dark' // This is crucial for the toolbar
  },
  // Add these styles for the toolbar
  colors: ['#3b82f6'],
  stroke: {
    colors: ['#0F172A']
  }
};
  const chartSeries = [{
    name: 'Balance',
    data: balances.map(b => b.amount)
  }];

  return (
    <div className="bg-slate-800 p-4 rounded-xl">
      <Chart options={chartOptions} series={chartSeries} type="bar" height={300} />
    </div>
  );
};

export default HoldingsChart;
