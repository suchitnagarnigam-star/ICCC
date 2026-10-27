import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab }) => {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(phoneNumber, pin);
      setCurrentTab('home');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your phone number and PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (rolePhone: string) => {
    setPhoneNumber(rolePhone);
    setPin('1234');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div className="civic-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="brand-badge" style={{ fontSize: '0.85rem' }}>MCL ICCC PORTAL</span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.5rem' }}>
            Staff &amp; Officer Sign In
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Enter your registered official phone number and security PIN.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Official Phone Number</label>
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
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {import.meta.env.DEV && (
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
                👷 Field JE (Kulwinder Singh - 9888897201)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', textAlign: 'left' }}
                onClick={() => handleQuickFill('9876543210')}
              >
                🏢 Desk Operator (MUKESH - 9876543210)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', textAlign: 'left' }}
                onClick={() => handleQuickFill('9999999999')}
              >
                🛡️ Administrator (ICCC Admin - 9999999999)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

