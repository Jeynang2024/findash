// src/App.jsx
import { useState, useEffect } from 'react';
import Binance from 'binance-api-node';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Indicator from './pages/Indicator';
import Chartboard from './pages/Chartboard';
function App() {
  const [ticker, setTicker] = useState({});

  /*useEffect(() => {
    const client = Binance();
    const clean = client.ws.ticker('BTCUSDT', data => {
      setTicker(data); 
      console.log(data)// live data from WebSocket
    });
    return () => {

      clean(); 

    }// unsubscribe on unmount
  }, []);*/

  return (
     < div className="wrapper">
      <Header />
      <div className="container mt-4 ">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Chartboard />} />

        </Routes>
      </div>
      <Footer/>
    </div>
  );
}

export default App;
