// src/App.jsx
import {  Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Footer from './components/Footer';
import Indicator from './pages/Indicator';
import BacktestDashboard from './pages/Backtest';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
function App() {


  return (
     < div className="wrapper">
      <Header />
      <div className="container mt-2 ">
        <Routes>
             <Route path="/" element={<Home />} />

          <Route path="/findash" element={<Home />} />
        <Route
          path="/login"
          element={ <Login />}
        />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Indicator /></ProtectedRoute>} />
          <Route path="/backtest" element={<ProtectedRoute><BacktestDashboard /></ProtectedRoute>} />

        </Routes>
      </div>
      <Footer/>
    </div>
  );
}

export default App;
