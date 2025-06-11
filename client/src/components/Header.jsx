// src/components/Header.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/header.css'; // Assuming you have a global CSS file for custom styles
export default function Header() {
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
          
            <span className="navbar-text me-auto"></span>
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink to="/login" className="nav-link ">Login</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/signup" className="nav-link ">Sign Up</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
