import React from 'react';
import { useAuth } from '../context/AuthContext';

interface MobileHeaderProps {
  onOpenDrawer: () => void;
  setCurrentTab: (tab: string) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenDrawer,
  setCurrentTab,
}) => {
  const { user, isAuthenticated, unreadCount } = useAuth();

  return (
    <header className="h-[52px] bg-[#0B1C30] text-white px-3 flex items-center justify-between sticky top-0 z-40 border-b border-[#213145] shadow-stitch-sm select-none">
      {/* Left: Hamburger + MCL Brand */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenDrawer}
          className="w-9 h-9 rounded flex items-center justify-center text-slate-200 hover:bg-[#1a2c42] transition"
          aria-label="Open Navigation Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('home')}>
          <div className="w-7 h-7 rounded bg-primary-container flex items-center justify-center text-white text-xs font-bold shadow-stitch-sm">
            🏛️
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white leading-none">MCL ICCC</span>
            <span className="text-[9px] text-slate-400 font-medium tracking-wide uppercase leading-tight">Ludhiana</span>
          </div>
        </div>
      </div>

      {/* Right: Alerts Bell + User Avatar */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setCurrentTab('alerts')}
          className="relative w-9 h-9 rounded flex items-center justify-center text-slate-200 hover:bg-[#1a2c42] transition"
          aria-label="Statutory Alerts"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-[#0B1C30]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isAuthenticated && user ? (
          <button
            onClick={onOpenDrawer}
            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-400/40"
            aria-label="User Profile"
          >
            {user.name.slice(0, 2).toUpperCase()}
          </button>
        ) : (
          <button
            onClick={() => setCurrentTab('login')}
            className="text-xs bg-primary hover:bg-primary-hover text-white px-2.5 py-1 rounded font-semibold transition"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

