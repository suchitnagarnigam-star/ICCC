import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedZone,
  setSelectedZone,
}) => {
  const { user, isAuthenticated, unreadCount } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) +
          ' | ' +
          now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }) +
          ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Operational Command Dashboard';
      case 'track':
        return 'Comprehensive Grievance Register';
      case 'register':
        return 'File Public Grievance';
      case 'officers':
        return 'Municipal Officer Administrative Ledger';
      case 'alerts':
        return 'Statutory Alerts & SLA Watch';
      case 'login':
        return 'Portal Authentication';
      case 'home':
      default:
        return 'Civic Infrastructure Portal';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-border-divider px-4 flex items-center justify-between sticky top-0 z-20 shadow-stitch-sm">
      {/* Left: Statutory Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
            MCL ICCC
          </span>
          <span className="text-slate-300">/</span>
          <h1 className="font-bold text-slate-900 text-sm tracking-tight">
            {getPageTitle()}
          </h1>
        </div>

        {/* Global Zone Selector */}
        <div className="hidden lg:flex items-center gap-1.5 ml-4 pl-4 border-l border-border-divider">
          <span className="text-[11px] font-medium text-slate-500">Zone Filter:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="text-xs font-semibold bg-surface-low border border-border-divider rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Ludhiana (Zones A-D)</option>
            <option value="Zone A">Zone A (Old City / Clock Tower)</option>
            <option value="Zone B">Zone B (Industrial Area / Cheema Chowk)</option>
            <option value="Zone C">Zone C (Gill Road / Shimlapuri)</option>
            <option value="Zone D">Zone D (Sarabha Nagar / Ferozepur Rd)</option>
          </select>
        </div>
      </div>

      {/* Right: Operational Status, Alerts & User Profile */}
      <div className="flex items-center gap-3">
        {/* Working Hours & Live Clock */}
        <div className="hidden md:flex flex-col items-end text-right pr-3 border-r border-border-divider">
          <span className="font-mono text-xs font-semibold text-slate-800 tnum">
            {currentTime}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Govt Working Hours: 09:00 - 17:00
          </span>
        </div>

        {/* Alerts Bell */}
        <button
          onClick={() => setCurrentTab('alerts')}
          className="relative p-2 rounded hover:bg-slate-100 text-slate-700 transition"
          title="Statutory Alerts & Notices"
          aria-label="Statutory Alerts"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Pill / Login Trigger */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-border-divider">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-stitch-sm">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono uppercase">
                {user.role} {user.branch ? `• ${user.branch}` : ''}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCurrentTab('login')}
            className="text-xs bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded font-semibold transition flex items-center gap-1.5 shadow-stitch-sm"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

