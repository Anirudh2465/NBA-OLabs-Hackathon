import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ScienceLabSim
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="navbar-item">Home</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;