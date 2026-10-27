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
      setError(err.message || 'Staff authentication failed. Check official mobile number and PIN.');
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
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        setCurrentTab('track');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Citizen registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (rolePhone: string) => {
    setPhoneNumber(rolePhone);
    setPin('1234');
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 bg-white border border-border-divider rounded p-6 shadow-stitch-sm space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded bg-primary-container text-white flex items-center justify-center font-bold text-lg mx-auto shadow-stitch-sm mb-2">
          🏛️
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-mono">
          SECURE MUNICIPAL ACCESS
        </span>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight pt-1">
          MCL ICCC Portal Sign In
        </h1>
        <p className="text-xs text-slate-500">
          Integrated Command &amp; Control Centre • Ludhiana
        </p>
      </div>

      {/* Role Switcher */}
      <div className="flex bg-surface-low p-1 rounded border border-border-divider text-xs">
        <button
          type="button"
          onClick={() => {
            setAuthMode('staff');
            setError(null);
          }}
          className={`flex-1 py-1.5 font-bold rounded transition text-center ${
            authMode === 'staff'
              ? 'bg-white text-primary shadow-stitch-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Staff &amp; Officers
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('citizen-login');
            setError(null);
          }}
          className={`flex-1 py-1.5 font-bold rounded transition text-center ${
            authMode !== 'staff'
              ? 'bg-white text-primary shadow-stitch-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Citizen Portal
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      {/* Form: Staff Login */}
      {authMode === 'staff' && (
        <form onSubmit={handleStaffLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Official Mobile Number *
            </label>
            <input
              type="tel"
              maxLength={10}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9815144612"
              className="w-full text-xs font-mono font-bold bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              4-Digit Official Security PIN *
            </label>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full text-xs font-mono font-bold bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-stitch-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>{loading ? 'Authenticating...' : 'Sign In as MCL Staff'}</span>
          </button>

          {/* Quick Demo Credentials */}
          <div className="pt-2 border-t border-border-divider">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
              Quick Test Credentials (PIN: 1234)
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => handleQuickFill('9815144612')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 rounded border border-slate-200 text-left font-mono"
              >
                SDO B&amp;R (Zone B)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('9815800001')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 rounded border border-slate-200 text-left font-mono"
              >
                JE Field Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('9815200001')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 rounded border border-slate-200 text-left font-mono"
              >
                XEN Executive Eng.
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('9814100001')}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 rounded border border-slate-200 text-left font-mono"
              >
                Command Operator
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Form: Citizen Login */}
      {authMode === 'citizen-login' && (
        <form onSubmit={handleCitizenLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Registered 10-Digit Mobile Number *
            </label>
            <input
              type="tel"
              maxLength={10}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9876543210"
              className="w-full text-xs font-mono font-bold bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              4-Digit PIN *
            </label>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full text-xs font-mono font-bold bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-stitch-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>{loading ? 'Signing in...' : 'Sign In as Citizen'}</span>
          </button>

          <div className="text-center pt-2 text-xs text-slate-600">
            First time registering a grievance?{' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode('citizen-register');
                setError(null);
              }}
              className="text-primary font-bold hover:underline"
            >
              Create Account
            </button>
          </div>
        </form>
      )}

      {/* Form: Citizen Register */}
      {authMode === 'citizen-register' && (
        <form onSubmit={handleCitizenRegister} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Harpreet Singh"
              className="w-full text-xs bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              10-Digit Mobile Number *
            </label>
            <input
              type="tel"
              maxLength={10}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9876543210"
              className="w-full text-xs font-mono font-bold bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Set 4-Digit Access PIN *
            </label>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="e.g. 1234"
              className="w-full text-xs font-mono font-bold bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-stitch-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>{loading ? 'Creating Account...' : 'Register &amp; Activate'}</span>
          </button>

          <div className="text-center pt-2 text-xs text-slate-600">
            Already registered?{' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode('citizen-login');
                setError(null);
              }}
              className="text-primary font-bold hover:underline"
            >
              Sign In
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginPage;
