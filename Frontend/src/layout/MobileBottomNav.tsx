import React from 'react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenDrawer,
}) => {
  const { unreadCount } = useAuth();

  return (
    <nav className="h-14 bg-white border-t border-border-divider fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around shadow-stitch-md select-none mobile-safe-bottom">
      {/* 1. Dashboard */}
      <button
        onClick={() => setCurrentTab('dashboard')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
          currentTab === 'dashboard'
            ? 'text-primary font-bold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
        aria-label="Command Dashboard"
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            currentTab === 'dashboard' ? 'fill' : ''
          }`}
        >
          dashboard
        </span>
        <span className="text-[10px] tracking-tight leading-tight mt-0.5">Dashboard</span>
      </button>

      {/* 2. Grievance Register */}
      <button
        onClick={() => setCurrentTab('track')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
          currentTab === 'track'
            ? 'text-primary font-bold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
        aria-label="Grievances Register"
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            currentTab === 'track' ? 'fill' : ''
          }`}
        >
          assignment
        </span>
        <span className="text-[10px] tracking-tight leading-tight mt-0.5">Grievances</span>
      </button>

      {/* 3. Center Elevated Action Button (FAB for Quick Intake / Camera) */}
      <div className="relative flex items-center justify-center px-1 -top-3">
        <button
          onClick={() => setCurrentTab('register')}
          className="w-12 h-12 rounded-full bg-primary hover:bg-primary-hover active:scale-95 text-white flex items-center justify-center shadow-fab border-4 border-canvas transition-all"
          title="File Grievance / Capture Evidence"
          aria-label="Register Grievance"
        >
          <span className="material-symbols-outlined text-[26px]">add</span>
        </button>
      </div>

      {/* 4. Alerts */}
      <button
        onClick={() => setCurrentTab('alerts')}
        className={`relative flex flex-col items-center justify-center flex-1 py-1 transition ${
          currentTab === 'alerts'
            ? 'text-primary font-bold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
        aria-label="Statutory Alerts"
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            currentTab === 'alerts' ? 'fill' : ''
          }`}
        >
          notifications
        </span>
        <span className="text-[10px] tracking-tight leading-tight mt-0.5">Alerts</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1/4 w-3.5 h-3.5 bg-red-600 text-white rounded-full text-[8px] font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 5. Menu Drawer */}
      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-slate-800 font-medium transition"
        aria-label="More Navigation"
      >
        <span className="material-symbols-outlined text-[22px]">menu</span>
        <span className="text-[10px] tracking-tight leading-tight mt-0.5">Menu</span>
      </button>
    </nav>
  );
};

