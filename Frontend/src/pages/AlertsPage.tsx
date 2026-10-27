import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import { apiFetch } from '../shared/utils/apiConfig';
import { useAuth } from '../context/AuthContext';

interface AlertsPageProps {
  onSelectComplaint?: (complaintId: string) => void;
  onNavigateToLogin?: () => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  onSelectComplaint,
  onNavigateToLogin,
}) => {
  const { isAuthenticated, refreshUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<string>('default');

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, [isAuthenticated]);

  async function loadNotifications() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      void refreshUnreadCount();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleRequestPush = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    const perm = await Notification.requestPermission();
    setPushStatus(perm);
    if (perm === 'granted') {
      alert('Push notifications enabled! You will receive critical SLA breach alerts.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-border-divider rounded p-8 text-center shadow-stitch-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-primary mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">lock</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">
            AUTHENTICATION REQUIRED
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-2">
            Statutory Notifications &amp; Escalation Inbox
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Please sign in with your staff or citizen account to view dispatch notices, SLA warnings, and grievance updates.
          </p>
        </div>
        <button
          onClick={onNavigateToLogin || (() => {})}
          className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-stitch-sm transition"
        >
          Sign In to Access Alerts &rarr;
        </button>
      </div>
    );
  }

  const unreadList = notifications.filter((n) => !n.isRead);

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-10">
      {/* Header */}
      <div className="bg-white border border-border-divider rounded p-4 shadow-stitch-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">
              ESC-WATCH
            </span>
            {unreadList.length > 0 && (
              <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-mono">
                {unreadList.length} Unread
              </span>
            )}
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Statutory Notifications &amp; Escalation Inbox
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time feed of SLA expirations, resolution verifications, and territorial reassignments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {pushStatus !== 'granted' && (
            <button
              onClick={handleRequestPush}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-surface-low hover:bg-surface-container text-primary border border-border-divider rounded transition"
            >
              <span className="material-symbols-outlined text-[16px]">notifications_active</span>
              <span className="hidden sm:inline">Enable Push</span>
            </button>
          )}
          <button
            onClick={loadNotifications}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-surface-low hover:bg-surface-container border border-border-divider rounded transition"
            title="Refresh Feed"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <div className="bg-white border border-border-divider rounded p-12 text-center text-slate-500 text-xs">
          Loading statutory notifications feed...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-border-divider rounded p-8 text-center text-slate-500 text-xs">
          No notifications or active SLA alerts for your account.
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((item) => {
            const isBreach = item.title && (item.title.includes('Breach') || item.title.includes('SLA'));
            return (
              <div
                key={item.id}
                className={`bg-white border rounded p-3.5 shadow-stitch-sm transition flex flex-col gap-2 ${
                  !item.isRead ? 'border-primary/40 bg-blue-50/20' : 'border-border-divider'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        !item.isRead ? 'bg-primary' : 'bg-slate-300'
                      }`}
                    />
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {isBreach && <span className="text-red-600">⚠️</span>}
                      <span>{item.title}</span>
                    </h3>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono tnum">
                    {new Date(item.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed pl-4">
                  {item.message}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 pl-4 text-xs">
                  <div className="flex items-center gap-2">
                    {item.complaintId && onSelectComplaint && (
                      <button
                        onClick={() => onSelectComplaint(item.complaintId!)}
                        className="text-primary hover:underline font-semibold flex items-center gap-0.5 text-xs"
                      >
                        <span>Inspect Case Dossier</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    )}
                  </div>

                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
