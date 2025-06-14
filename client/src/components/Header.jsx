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
          <span className="navbar-text me-auto"></span>
          <ul className="navbar-nav">
            {!isAuthenticated ? (
              <>
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
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

/*import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/header.css'; // Assuming you have a global CSS file for custom styles
export default function Header() {


const isAuthenticated = localStorage.getItem("token"); // or whatever your key is






  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand text-gradient" to="/">FinDash</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          
         <ul className="navbar-nav">
  {!isAuthenticated ? (
    <>
      <li className="nav-item">
        <NavLink to="/login" className="nav-link">Login</NavLink>
      </li>
      <li className="nav-item">
        <NavLink to="/signup" className="nav-link">Sign Up</NavLink>
      </li>
    </>
  ) : (
    <>
      <li className="nav-item">
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
      </li>
      <li className="nav-item">
        <button className="nav-link btn btn-link" onClick={() => {
          localStorage.removeItem("token");
          window.location.reload(); // refresh to update UI
        }}>Logout</button>
      </li>
    </>
  )}
</ul>




        </div>
      </div>
    </nav>
  );
}
*/