// src/components/Header.jsx


import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

import { Link, NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/header.css';

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/"); // optional if full reload needed
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand text-gradient" to="/">FinDash</Link>
        

        <div className=" navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
           
              
              <li className="nav-item">
                  <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/backtest" className="nav-link">Backtest</NavLink>
                </li>
              </ul>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link">Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/signup" className="nav-link">Sign Up</NavLink>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
           
        </div>
      </div>
    </nav>
  );
}
