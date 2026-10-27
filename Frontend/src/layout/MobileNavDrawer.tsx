import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
}) => {
  const { user, isAuthenticated, logout, unreadCount } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    onClose();
  };

  const navLinks = [
    { id: 'dashboard', label: 'Command Dashboard', icon: 'dashboard', badge: null },
    { id: 'track', label: 'Grievance Register', icon: 'assignment', badge: null },
    { id: 'register', label: 'File Grievance', icon: 'add_circle', badge: null },
    { id: 'officers', label: 'Ward Officers (1-95)', icon: 'badge', badge: null },
    { id: 'alerts', label: 'Statutory Alerts', icon: 'notifications', badge: unreadCount > 0 ? unreadCount : null },
    { id: 'home', label: 'Civic Public Portal', icon: 'public', badge: null },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="relative w-72 max-w-[80vw] bg-[#0B1C30] text-slate-100 h-full flex flex-col justify-between shadow-stitch-modal z-10 border-r border-[#213145] select-none">
        <div>
          {/* Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-[#213145] bg-[#071322]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-white font-bold text-sm">
                🏛️
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white leading-tight">MCL ICCC</span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Ludhiana Municipal</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white"
              aria-label="Close Menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3 mx-3 mt-3 rounded bg-[#16273c] border border-[#263a54]">
            {isAuthenticated && user ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{user.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{user.phoneNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1 pt-1.5 border-t border-[#263a54] text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono font-semibold uppercase">
                    {user.role}
                  </span>
                  {user.zone && <span className="text-slate-300">Zone {user.zone}</span>}
                  {user.wardNumber && <span className="text-slate-300">• Ward {user.wardNumber}</span>}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200">Public Citizen</span>
                  <span className="text-[10px] text-slate-400">Official staff? Sign in below</span>
                </div>
                <button
                  onClick={() => handleNav('login')}
                  className="text-xs bg-primary hover:bg-primary-hover text-white px-2.5 py-1 rounded font-semibold transition"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 flex flex-col gap-1 mt-2">
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Municipal Services
            </span>
            {navLinks.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition ${
                    isActive
                      ? 'bg-primary text-white font-semibold shadow-stitch-sm'
                      : 'text-slate-300 hover:bg-[#1a2c42] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="bg-red-500 text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Contacts & Logout */}
        <div className="p-3 border-t border-[#213145] bg-[#071322] flex flex-col gap-2.5">
          <div className="bg-[#101d2d] p-2 rounded border border-[#1e3146] text-[10px] text-slate-400">
            <div className="font-semibold text-slate-300 mb-0.5">Municipal Control Room:</div>
            <div>📞 0161-2746400 / 1800-1800-172</div>
            <div>Working Hours: 09:00 - 17:00 IST</div>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded bg-red-950/60 hover:bg-red-900/80 text-red-200 text-xs font-semibold border border-red-800/60 transition"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out of Portal</span>
            </button>
          ) : (
            <button
              onClick={() => handleNav('login')}
              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-stitch-sm transition"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>Staff / Citizen Sign In</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};
