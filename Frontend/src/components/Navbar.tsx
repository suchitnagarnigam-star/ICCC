import React from 'react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, isAuthenticated, logout, unreadCount } = useAuth();

  const isStaff = isAuthenticated && user?.role && user.role !== 'citizen';

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

          {isStaff && (
            <button
              className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentTab('dashboard')}
            >
              Command Center
            </button>
          )}

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
            {user?.role === 'citizen' ? 'My Grievances' : 'Track Complaints'}
          </button>

          <button
            className={`nav-link ${currentTab === 'officers' ? 'active' : ''}`}
            onClick={() => setCurrentTab('officers')}
          >
            Ward Officers
          </button>

          {isAuthenticated && (
            <button
              className={`nav-link ${currentTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setCurrentTab('alerts')}
              style={{ position: 'relative' }}
            >
              Alerts
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: '6px',
                    fontSize: '0.68rem',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 800,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#E2E8F0', fontWeight: 600 }}>
                {user?.name} <span style={{ color: '#FCD34D' }}>({user?.role?.toUpperCase()})</span>
              </span>
              <button
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderColor: '#475569', color: '#E2E8F0' }}
                onClick={() => {
                  logout();
                  setCurrentTab('home');
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', backgroundColor: 'var(--color-accent)' }}
              onClick={() => setCurrentTab('login')}
            >
              Sign In / Register
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
