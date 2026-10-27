import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab }) => {
  const { login, registerCitizen } = useAuth();
  const [authMode, setAuthMode] = useState<'staff' | 'citizen-login' | 'citizen-register'>('staff');

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(phoneNumber.trim(), pin.trim(), 'staff');
      setCurrentTab('dashboard');
    } catch (err: any) {
      setError(err.message || 'Staff login failed. Check official phone number and PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(phoneNumber.trim(), pin.trim(), 'citizen');
      setCurrentTab('track');
    } catch (err: any) {
      setError(err.message || 'Citizen login failed. Check mobile number and PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitizenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await registerCitizen(name.trim(), phoneNumber.trim(), pin.trim());
      setSuccess('Account created successfully! You are now logged in.');
      setTimeout(() => {
        setCurrentTab('track');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (rolePhone: string) => {
    setPhoneNumber(rolePhone);
    setPin('1234');
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto' }}>
      <div className="civic-card">
        {/* Portal Type Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setAuthMode('staff');
              setError(null);
            }}
            style={{
              padding: '0.45rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: authMode === 'staff' ? '#FFFFFF' : 'transparent',
              color: authMode === 'staff' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: authMode === 'staff' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            🏛️ Staff &amp; Officers
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('citizen-login');
              setError(null);
            }}
            style={{
              padding: '0.45rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: authMode !== 'staff' ? '#FFFFFF' : 'transparent',
              color: authMode !== 'staff' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: authMode !== 'staff' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            👤 Citizen Portal
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="brand-badge" style={{ fontSize: '0.82rem' }}>
            {authMode === 'staff' ? 'MCL MUNICIPAL ROSTER' : 'MCL CITIZEN SERVICES'}
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.4rem' }}>
            {authMode === 'staff'
              ? 'Staff & Officer Sign In'
              : authMode === 'citizen-login'
              ? 'Citizen Sign In'
              : 'Create Citizen Account'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {authMode === 'staff'
              ? 'Access territorial grievances, SLA management, and work consoles.'
              : authMode === 'citizen-login'
              ? 'Sign in to monitor all your filed and claimed complaints.'
              : 'Register to file complaints and receive official resolution updates.'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {success}
          </div>
        )}

        {/* 1. Staff Login Form */}
        {authMode === 'staff' && (
          <form onSubmit={handleStaffLogin}>
            <div className="form-group">
              <label className="form-label">Official Registered Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 9888897201"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Security PIN</label>
              <input
                type="password"
                className="form-input"
                placeholder="4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.65rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating Staff...' : 'Sign In as Officer'}
            </button>
          </form>
        )}

        {/* 2. Citizen Login Form */}
        {authMode === 'citizen-login' && (
          <form onSubmit={handleCitizenLogin}>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">PIN</label>
              <input
                type="password"
                className="form-input"
                placeholder="4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.65rem' }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In as Citizen'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('citizen-register');
                  setError(null);
                }}
                style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
              >
                Register here
              </button>
            </div>
          </form>
        )}

        {/* 3. Citizen Registration Form */}
        {authMode === 'citizen-register' && (
          <form onSubmit={handleCitizenRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="10-digit mobile number"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Create a 4-Digit Security PIN</label>
              <input
                type="password"
                className="form-input"
                placeholder="Choose a 4-digit PIN"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>

            <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#EFF6FF', borderRadius: '6px', fontSize: '0.75rem', color: '#1E40AF', marginBottom: '1rem' }}>
              ℹ️ Direct Account Activation: SMS gateway verification is simulated for instant onboarding.
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Complete Citizen Registration'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('citizen-login');
                  setError(null);
                }}
                style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
              >
                Sign in here
              </button>
            </div>
          </form>
        )}

        {/* Local Dev Quick-Fill */}
        {import.meta.env.DEV && authMode === 'staff' && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-sub)', marginBottom: '0.5rem' }}>
              🛠️ Local Development Quick-Fill:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', textAlign: 'left' }}
                onClick={() => handleQuickFill('9888897201')}
              >
                👔 XEN Raman Kaushal (B&amp;R Supervisor - 9888897201)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', textAlign: 'left' }}
                onClick={() => handleQuickFill('9815144612')}
              >
                💧 SDO Anshul Garcha (O&amp;M Supervisor - 9815144612)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', textAlign: 'left' }}
                onClick={() => handleQuickFill('9646222900')}
              >
                👷 JE Vikas Kumar (Ward 1 Field Officer - 9646222900)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', textAlign: 'left' }}
                onClick={() => handleQuickFill('9876543210')}
              >
                🖥️ Operator Mukesh (ICCC Control Desk - 9876543210)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
