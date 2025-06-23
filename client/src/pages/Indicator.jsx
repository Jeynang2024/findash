import React, { useEffect, useState,useCallback,memo } from 'react';
import Chartboard from './Chartboard'; 
import Lashboard from './Dashboard' 
import HoldingsChart from '../components/Holdings';
import axios from "axios"
import dotenv from 'dotenv';
import { useNavigate } from 'react-router-dom';
dotenv.config();
import "../styles/header.css";

const Dashboard = () => {


   const navigate = useNavigate();

  useEffect(()=>{
      const token=localStorage.getItem("token");
      if(!token){
        navigate("/login", { replace: true });
        return;
      }}
    ,[])
const [totalBalance, setTotalBalance] = useState(0);
const [balances, setBalances] = useState([]);
const [profit ,setProfit]=useState([0]);
const BE = import.meta.env.VITE_BE;

const handleBalancesUpdate = useCallback((fetchedBalances) => {
    setBalances(fetchedBalances);
    const usdtBalance = fetchedBalances.find(b => b.asset === 'USDT');
    if (usdtBalance) {
      setTotalBalance(parseFloat(usdtBalance.free) + parseFloat(usdtBalance.locked));
    }
  }, []);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return false;
    }
    return true;
  }, [navigate]);

  useEffect(() => {
    if (!checkAuth()) return;
  const fetchProfit = async () => {
const token=localStorage.getItem("token");
//console.log('Token: here', token);
    if(!token){
      navigate("/login", { replace: true });
      return;
    }    
    try {
        const { data } = await axios.get(`${BE}/profit`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
              setProfit(data.profit)
    } catch (error) {
      console.error('Error fetching profit:', error)
      if (error.response?.status === 401) {
          navigate("/login", { replace: true });
        }
    }
  }

  fetchProfit()
}, [BE, checkAuth, navigate]);


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
        <div                 style={{ backgroundColor: '#1e1b2e	' }} 

        className=" p-4 flex items-center justify-between ">
           
          <div className="text-xl font-bold text-gradient">Dashboard</div>
          
        </div>

        <div className="p-6 ">
         
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div                 style={{ backgroundColor: '#1e1b2e	' }} 

            className=" lg:col-span-2 p-4 rounded-xl overflow-hidden">
              <Chartboard/>
            
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
                 <div  
                style={{ backgroundColor: '#1e1b2e	' }} 
                className=" rounded-xl p-4">
               <p className="text-sm text-gray-400">Profit</p>
               <h2 className="text-xl font-semibold">
               { `$${formatBalance(profit)}` }
                </h2>
                </div>
              <Lashboard/>
   
            </div>
          </div>

          <div                 style={{ backgroundColor: '#1e1b2e	' }} 
className="mt-3  p-4 rounded-xl overflow-x-auto">
          <HoldingsChart onBalancesUpdate={handleBalancesUpdate} />

           


          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default memo(Dashboard);