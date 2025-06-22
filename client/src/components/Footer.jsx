// src/components/Footer.jsx
import React, { memo } from "react";
import { Link } from "react-router-dom";
import "../styles/footer.css"; // Assuming you have a global CSS file for custom styles

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container ">
        
        <div className="footer-right text-start">
          <p className="footer-credit">© {new Date().getFullYear()} FinDash</p>
        </div>
      </div>
    </footer>
  );
}export default memo(Footer);
