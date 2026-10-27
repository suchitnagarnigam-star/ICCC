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
    <div className="space-y-6 pb-12">
      {/* 1. Civic Hero Banner */}
      <div className="bg-[#0B1C30] text-white rounded p-6 sm:p-8 shadow-stitch-md border border-[#213145] relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-900/60 border border-blue-500/40 text-[10px] font-bold text-blue-200 uppercase tracking-wider font-mono">
            <span>🏛️ MUNICIPAL CORPORATION LUDHIANA</span>
            <span>•</span>
            <span>ICCC COMMAND CENTER</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
            Integrated Civic Redressal &amp; Public Works Telemetry
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Official municipal portal connecting citizens across Ludhiana's 95 wards with field Junior Engineers, departmental supervisors (B&amp;R, O&amp;M, Health, Light), and city commissioners under a 48-working-hour statutory resolution protocol.
          </p>

          {/* Quick Track Input Bar */}
          <form
            onSubmit={handleHeroTrack}
            className="bg-white p-2 sm:p-2.5 rounded shadow-stitch-lg flex flex-col sm:flex-row gap-2 max-w-2xl"
          >
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                tag
              </span>
              <input
                type="text"
                placeholder="Complaint # (e.g. MCL-2026-0001)"
                value={quickNumber}
                onChange={(e) => setQuickNumber(e.target.value.toUpperCase())}
                className="w-full text-xs font-mono font-bold pl-8 pr-3 py-2 bg-surface-low border border-border-divider rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="relative sm:w-48">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                call
              </span>
              <input
                type="tel"
                placeholder="10-Digit Mobile"
                maxLength={10}
                value={quickPhone}
                onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full text-xs font-mono pl-8 pr-3 py-2 bg-surface-low border border-border-divider rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-stitch-sm transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>Track Grievance</span>
            </button>
          </form>
        </div>
      </div>

      {/* 2. 4 Primary Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* File Grievance */}
        <div
          onClick={() => setCurrentTab('register')}
          className="bg-white border border-border-divider hover:border-primary rounded p-5 shadow-stitch-sm transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded bg-blue-50 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center mb-3 transition">
              <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">File Public Grievance</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit civic defects with on-site photographic evidence, GPS landmark, and automatic ward dispatch.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-divider text-xs font-semibold text-primary flex items-center gap-1">
            <span>Register Now</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>

        {/* Track Status */}
        <div
          onClick={() => setCurrentTab('track')}
          className="bg-white border border-border-divider hover:border-primary rounded p-5 shadow-stitch-sm transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded bg-indigo-50 group-hover:bg-primary group-hover:text-white text-indigo-700 flex items-center justify-center mb-3 transition">
              <span className="material-symbols-outlined text-[24px]">fact_check</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Track &amp; Verify Status</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inspect before-and-after resolution proof photos, assigned officer details, and submit completion ratings.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-divider text-xs font-semibold text-primary flex items-center gap-1">
            <span>Open Register</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>

        {/* Ward Officers Directory */}
        <div
          onClick={() => setCurrentTab('officers')}
          className="bg-white border border-border-divider hover:border-primary rounded p-5 shadow-stitch-sm transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded bg-emerald-50 group-hover:bg-primary group-hover:text-white text-emerald-700 flex items-center justify-center mb-3 transition">
              <span className="material-symbols-outlined text-[24px]">badge</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Ward Officers Directory</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official roster of all 95 Ludhiana wards. Direct phone numbers for designated JEs, SDOs, and XENs.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-divider text-xs font-semibold text-primary flex items-center gap-1">
            <span>Browse Directory</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>

        {/* Staff Sign In / Command Desk */}
        <div
          onClick={() => setCurrentTab(isAuthenticated ? 'dashboard' : 'login')}
          className="bg-white border border-border-divider hover:border-primary rounded p-5 shadow-stitch-sm transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded bg-slate-100 group-hover:bg-primary group-hover:text-white text-slate-700 flex items-center justify-center mb-3 transition">
              <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              {isAuthenticated ? 'Operational Command' : 'Official Portal Login'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAuthenticated
                ? 'Access operational telemetry, urgent SLA queue, and field officer reassignments.'
                : 'Authentication gateway for Municipal Corporation staff, field engineers, and registered citizens.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border-divider text-xs font-semibold text-primary flex items-center gap-1">
            <span>{isAuthenticated ? 'Open Dashboard' : 'Staff Sign In'}</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>
      </div>

      {/* 3. Statutory 48-Hour SLA Guarantee Strip */}
      <div className="bg-white border border-border-divider rounded p-5 shadow-stitch-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Statutory 48-Working-Hour Redressal Standard
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Operating under Punjab Municipal Corporation Citizen Charter. All grievances are timestamped and assigned within 2 working hours.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Working Hours</span>
            <strong className="text-slate-900">09:00 – 17:00 IST</strong>
          </div>
          <div className="border-l border-border-divider pl-4">
            <span className="text-[10px] text-slate-400 block uppercase">Helpline</span>
            <strong className="text-slate-900">0161-2746400</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
