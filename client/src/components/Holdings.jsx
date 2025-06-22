import React, { useEffect, useState,memo } from 'react';
import Chart from 'react-apexcharts';
import '../styles/holdings.css';
import axios from 'axios'; // Import your custom styles
const HoldingsChart = ({ onBalancesUpdate }) => {
  const [balances, setBalances] = useState([]);
const token = localStorage.getItem('token');


  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const res = await axios.get('http://localhost:5001/account', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        
        if (!Array.isArray(res.data)) {
          console.error('Expected array but got:', res.data);
          return [];
        }
        
        const filtered = res.data
          .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
          .map(b => ({ 
            asset: b.asset, 
            amount: parseFloat(b.free) 
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 20);

        setBalances(filtered);
        
        if (onBalancesUpdate) {
          onBalancesUpdate(res.data);
        }
      } catch (error) {
        alert('Please Login to get see your holdings');
console.error('Full error details:', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    headers: error.config?.headers,
    url: error.config?.url
  });        // You might want to set some error state here
        return [];
      }
    };
    
    fetchBalances();
  }, [token, onBalancesUpdate]); // Added dependencies


 const chartOptions = {
  chart: {
    type: 'bar',
    foreColor: 'rgba(120, 21, 169, 0)',
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
        background: "rgba(68, 50, 94, 0.3)",

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
  colors: ['rgba(149, 72, 188, 0.8)'],
  stroke: {
    colors: ['#0F172A']
  },
   xaxis: {
    type: 'category',
    categories: balances.map(b => b.asset),
    labels: {
      style: {
        colors: '#CBD5E1',
        fontSize: '12px',
      }
    }
  },
};
  const chartSeries = [{
    name: 'Balance',
    data: balances.map(b => b.amount)
  }];

  return (
    <div className=" p-4 rounded-xl">
      <Chart options={chartOptions} series={chartSeries} type="bar" height={300} />
    </div>
  );
};

export default memo(HoldingsChart);
