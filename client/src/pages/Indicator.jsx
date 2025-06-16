import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import Chartboard from './Chartboard'; 
import Lashboard from './Dashboard' 
import HoldingsChart from '../components/Holdings';
import { Link } from 'react-router-dom';
import "../styles/header.css";
const Dashboard = () => {
const [totalBalance, setTotalBalance] = useState(0);
const [balances, setBalances] = useState([]);

  
 const handleBalancesUpdate = (fetchedBalances) => {
    setBalances(fetchedBalances);
    
    // Find USDT balance
    const usdtBalance = fetchedBalances.find(b => b.asset === 'USDT');
    if (usdtBalance) {
      setTotalBalance(parseFloat(usdtBalance.free) + parseFloat(usdtBalance.locked));
    }
  };

  // Format balance with commas
  const formatBalance = (balance) => {
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  return (
    <div>
      
        <div className="min-h-screen gradient-border text-white flex">

      <div className="flex-1 overflow-x-hidden">
        {/* Header with toggle button */}
        <div                 style={{ backgroundColor: '#1e1b2e	' }} 

        className=" p-4 flex items-center justify-between ">
            <div className="flex space-x-4 ml-4">
    <Link to="/backtest"  className="text-violet-900 hover:text-violet-300 font-medium">
      Backtest
    </Link>
    <Link to="/livetrading" className="text-green-400 hover:text-green-300 font-medium">
      Live Trading
    </Link>
  </div>
          <div className="text-xl font-bold text-gradient">Dashboard</div>
          
        </div>

        <div className="p-6 ">
          {/*
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
             <div className="bg-gray-800 rounded-xl p-4">
    <p className="text-sm text-gray-400">Account Balance</p>
    <h2 className="text-xl font-semibold">
      {totalBalance > 0 ? `$${formatBalance(totalBalance)}` : 'Loading...'}
    </h2>
  </div>
           
          </div>*/}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div                 style={{ backgroundColor: '#1e1b2e	' }} 

            className=" lg:col-span-2 p-4 rounded-xl overflow-hidden">
              <Chartboard/>
            { /* <h3 className="mb-4 font-semibold">Unique Visitors</h3>
              <Chart options={lineOptions} series={lineSeries} type="area" height={300} />*/}
            </div>

            <div                 style={{ backgroundColor: '#1e1b2e	' }} 

            className=" p-4 rounded-xl">
                <div  
                style={{ backgroundColor: '#1e1b2e	' }} 
                className=" rounded-xl p-4">
               <p className="text-sm text-gray-400">Account Balance</p>
               <h2 className="text-xl font-semibold">
                {totalBalance > 0 ? `$${formatBalance(totalBalance)}` : 'Loading...'}
                </h2>
                </div>
              <Lashboard/>
             {/* <h3 className="mb-4 font-semibold">This Week Statistics</h3>
              <Chart options={barOptions} series={barSeries} type="bar" height={300} />*/}
            </div>
          </div>

          {/* Table */}
          <div                 style={{ backgroundColor: '#1e1b2e	' }} 
className="mt-3  p-4 rounded-xl overflow-x-auto">
          <HoldingsChart onBalancesUpdate={handleBalancesUpdate} />

            {/*<h3 className="font-semibold mb-3">Recent Orders</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="p-2">Tracking No</th>
                  <th className="p-2">Product Name</th>
                  <th className="p-2">Total Order</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1258963', 'Keyboard', 36, 'Rejected'],
                  ['1258698', 'Computer Accessories', 106, 'Approved'],
                  ['5454584', 'Camera Lens', 40, 'Rejected'],
                ].map(([id, name, count, status], idx) => (
                  <tr key={idx} className="border-t border-gray-700">
                    <td className="p-2">{id}</td>
                    <td className="p-2">{name}</td>
                    <td className="p-2">{count}</td>
                    <td className={`p-2 ${status === 'Approved' ? 'text-green-400' : 'text-red-400'}`}>
                      {status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>*/}


          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;