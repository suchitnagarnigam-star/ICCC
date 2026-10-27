import React from 'react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-section" onClick={() => setCurrentTab('home')} style={{ cursor: 'pointer' }}>
          <span className="brand-badge">ICCC</span>
          <div>
            <div className="brand-title">Municipal Corporation Ludhiana</div>
            <div className="brand-subtitle">Smart Civic Complaint Management System</div>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentTab('home')}
          >
            Overview
          </button>
          <button
            className={`nav-link ${currentTab === 'register' ? 'active' : ''}`}
            onClick={() => setCurrentTab('register')}
          >
            Register Grievance
          </button>
          <button
            className={`nav-link ${currentTab === 'track' ? 'active' : ''}`}
            onClick={() => setCurrentTab('track')}
          >
            Track Complaints
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                {user?.name} ({user?.role?.toUpperCase()})
              </span>
              <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={logout}>
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => setCurrentTab('login')}
            >
              Staff Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

