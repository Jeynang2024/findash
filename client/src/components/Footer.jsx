// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css"; // Assuming you have a global CSS file for custom styles

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <Link className="footer-link gradient-text" to="/">Home</Link>
          <span></span>
          <Link className="footer-link gradient-text" to="/about">About</Link>
       
        </div>
        <div className="footer-right">
          <p className="footer-credit">© {new Date().getFullYear()} FinDash</p>
        </div>
      </div>
    </footer>
  );
}
