import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  onQuickTrack?: (complaintNumber: string, phone: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentTab, onQuickTrack }) => {
  const { isAuthenticated } = useAuth();
  const [quickNumber, setQuickNumber] = useState('');
  const [quickPhone, setQuickPhone] = useState('');

  const handleHeroTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickNumber && quickPhone && onQuickTrack) {
      onQuickTrack(quickNumber, quickPhone);
    } else {
      setCurrentTab('track');
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Hero Banner with Civic Header & Quick Tracker */}
      <div
        className="civic-card"
        style={{
          background: 'linear-gradient(135deg, #0F294A 0%, #1E3A8A 100%)',
          color: '#FFFFFF',
          padding: '2.5rem 2rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'rgba(217, 119, 6, 0.25)', border: '1px solid #D97706', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FEF3C7', letterSpacing: '0.05em' }}>
              MCL INTEGRATED COMMAND &amp; CONTROL CENTER
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.2, margin: '0 0 0.75rem 0' }}>
            Smart Civic Grievance Redressal &amp; Public Works Monitoring
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#E2E8F0', lineHeight: 1.6, marginBottom: '2rem' }}>
            Official municipal platform connecting citizens across 95 wards with field Junior Engineers, departmental supervisors (B&amp;R, O&amp;M, Health, Light), and city commissioners under a 48-working-hour resolution target.
          </p>

          {/* Quick Track Input Bar */}
          <form
            onSubmit={handleHeroTrack}
            style={{
              backgroundColor: '#FFFFFF',
              padding: '0.75rem',
              borderRadius: '8px',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <input
              type="text"
              placeholder="Complaint # (e.g. MCL-2026-0985)"
              value={quickNumber}
              onChange={(e) => setQuickNumber(e.target.value.toUpperCase())}
              style={{
                flex: '1 1 200px',
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: 'var(--color-text-main)',
              }}
            />
            <input
              type="tel"
              placeholder="10-Digit Mobile Number"
              maxLength={10}
              value={quickPhone}
              onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, ''))}
              style={{
                flex: '1 1 180px',
                padding: '0.65rem 0.85rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: 'var(--color-text-main)',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontWeight: 800, whiteSpace: 'nowrap' }}
            >
              🔍 Track Status
            </button>
          </form>
        </div>
      </div>

      {/* Main Grid: Core Services */}
      <div className="civic-grid">
        <div className="civic-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📢</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              Register Civic Grievance
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              File grievances with photographic proof across Water Supply, Sewerage, Potholes, Street Lights, or Sanitation. Automatically assigned to your ward's Junior Engineer.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setCurrentTab('register')} style={{ width: '100%', justifyContent: 'center' }}>
            File a New Grievance →
          </button>
        </div>

        <div className="civic-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              Complaints &amp; SLA Tracking
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Real-time public tracking and full operational registry. Citizens verify resolution before closure; supervisors monitor 48-hour SLA countdowns.
            </p>
          </div>
          <button className="btn-secondary" onClick={() => setCurrentTab('track')} style={{ width: '100%', justifyContent: 'center' }}>
            Open Tracking Portal →
          </button>
        </div>

        <div className="civic-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👥</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              Officers &amp; Ward Directory
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Territorial roster for all 95 wards. Look up your Junior Engineer, SDO, and Executive Engineer with verified direct contact numbers.
            </p>
          </div>
          <button className="btn-secondary" onClick={() => setCurrentTab('officers')} style={{ width: '100%', justifyContent: 'center' }}>
            Browse Ward Officers →
          </button>
        </div>

        <div className="civic-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏛️</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              Executive Command Center
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              High-density control room dashboard for supervisors (SDO, XEN, SE) and desk operators. Monitor breach risks, workload distribution, and dispatch crews.
            </p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => setCurrentTab(isAuthenticated ? 'dashboard' : 'login')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isAuthenticated ? 'Open Dashboard →' : 'Staff Sign In →'}
          </button>
        </div>
      </div>

      {/* 48-Hour SLA Banner */}
      <div className="civic-card" style={{ marginTop: '2rem', backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ fontSize: '1.75rem' }}>⏱️</div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E3A8A', margin: '0 0 0.35rem 0' }}>
              Strict 48-Working-Hour Resolution Protocol (Punjab Municipal Standards)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#1E40AF', margin: 0, lineHeight: 1.5 }}>
              All complaints are governed by an official 48-working-hour resolution target calculated during active municipal hours (Monday–Friday, 09:00–17:00 IST), excluding official Gazetted holidays. Breaches trigger automatic supervisory escalation to Sub-Divisional Officers and Executive Engineers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
