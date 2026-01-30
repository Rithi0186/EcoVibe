import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Leaf, RefreshCw, User } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <div className="navbar-logo">
          <img src={logo} alt="EcoVibe Logo" style={{ height: '40px', width: '40px' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>EcoVibe</span>
        </div>
        <ul className="navbar-menu">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Home size={20} />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/footprint" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Leaf size={20} />
              <span>Footprint</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/greenswap" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <RefreshCw size={20} />
              <span>Swap</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <User size={20} />
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </div>
      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--color-border);
          z-index: 1000;
          padding: 0.75rem 0;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .navbar-menu {
          display: flex;
          gap: 2rem;
          list-style: none;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-muted);
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--color-primary);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
