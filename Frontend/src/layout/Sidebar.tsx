import React from 'react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, isAuthenticated, logout, unreadCount } = useAuth();

  const isRoleAuthorized = (minRole: 'all' | 'staff' | 'supervisor') => {
    if (minRole === 'all') return true;
    if (!user) return false;
    if (minRole === 'staff') {
      return ['field_officer', 'supervisor', 'admin', 'operator', 'je', 'sdo', 'xen'].includes(user.role.toLowerCase());
    }
    if (minRole === 'supervisor') {
      return ['supervisor', 'admin', 'sdo', 'xen', 'superadmin'].includes(user.role.toLowerCase());
    }
    return false;
  };

  const navItems = [
    {
      group: 'OPERATIONAL COMMAND',
      items: [
        { id: 'dashboard', label: 'Command Dashboard', icon: 'dashboard', badge: null, auth: 'all' as const },
        { id: 'track', label: 'Grievance Register', icon: 'assignment', badge: null, auth: 'all' as const },
        { id: 'alerts', label: 'Statutory Alerts', icon: 'notifications', badge: unreadCount > 0 ? unreadCount : null, auth: 'staff' as const },
      ],
    },
    {
      group: 'ADMINISTRATION & ROSTER',
      items: [
        { id: 'officers', label: 'Ward Officers (1-95)', icon: 'badge', badge: null, auth: 'all' as const },
      ],
    },
    {
      group: 'CITIZEN SERVICES',
      items: [
        { id: 'register', label: 'File Grievance', icon: 'add_circle', badge: null, auth: 'all' as const },
        { id: 'home', label: 'Public Portal', icon: 'public', badge: null, auth: 'all' as const },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-[#0B1C30] text-slate-100 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-[#213145] z-30 select-none">
      {/* Top Header & Municipal Seal */}
      <div className="flex flex-col">
        <div className="h-14 px-4 flex items-center gap-3 border-b border-[#213145] bg-[#071322]">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-white font-bold text-sm shadow-stitch-sm">
            🏛️
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white leading-tight">MCL ICCC</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Municipal Corp Ludhiana</span>
          </div>
        </div>

        {/* User Status Card */}
        <div className="p-3 mx-2 mt-2 rounded bg-[#16273c] border border-[#263a54]">
          {isAuthenticated && user ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white truncate max-w-[130px]">{user.name}</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px] font-semibold uppercase">
                  {user.role}
                </span>
                {user.zone && (
                  <span className="text-[10px] text-slate-400">Zone {user.zone}</span>
                )}
                {user.wardNumber && (
                  <span className="text-[10px] text-slate-400">• Ward {user.wardNumber}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">Public Access</span>
                <span className="text-[10px] text-slate-400">Sign in for official duty</span>
              </div>
              <button
                onClick={() => setCurrentTab('login')}
                className="text-xs bg-primary hover:bg-primary-hover text-white px-2 py-1 rounded font-medium transition"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="p-2 flex flex-col gap-4 mt-2 overflow-y-auto max-h-[calc(100vh-220px)]">
          {navItems.map((group) => {
            const accessibleItems = group.items.filter((item) => isRoleAuthorized(item.auth));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.group} className="flex flex-col gap-0.5">
                <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {group.group}
                </span>
                {accessibleItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentTab(item.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-white font-semibold shadow-stitch-sm'
                          : 'text-slate-300 hover:bg-[#1a2c42] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[18px]">
                          {item.icon}
                        </span>
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
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-3 border-t border-[#213145] bg-[#071322] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            ICCC v2.4 Active
          </span>
          <span className="text-[10px] text-slate-400">09:00 - 17:00 IST</span>
        </div>

        {isAuthenticated && (
          <button
            onClick={logout}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded bg-slate-800/80 hover:bg-red-900/60 hover:text-red-200 text-slate-300 text-xs font-medium border border-slate-700/60 transition"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
