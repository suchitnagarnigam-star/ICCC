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
      <div className="civic-card" style={{ maxWidth: '520px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <span className="brand-badge">AUTHENTICATION REQUIRED</span>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--color-primary)' }}>
          Notifications &amp; Escalation Inbox
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Please sign in with your staff or citizen account to view dispatch notices, SLA warnings, and grievance updates.
        </p>
        <button
          className="btn-primary"
          onClick={onNavigateToLogin || (() => {})}
          style={{ padding: '0.65rem 1.5rem', fontWeight: 700 }}
        >
          Sign In to Access Alerts →
        </button>
      </div>
    );
  }

  const unreadList = notifications.filter((n) => !n.isRead);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="brand-badge">INBOX</span>
            {unreadList.length > 0 && (
              <span style={{ fontSize: '0.75rem', backgroundColor: '#FEE2E2', color: '#DC2626', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                {unreadList.length} Unread
              </span>
            )}
          </div>
          <h1 className="civic-title" style={{ marginTop: '0.35rem' }}>
            Notifications &amp; SLA Alerts
          </h1>
          <p className="civic-desc">
            Official operational alerts, assignment notifications, and 48-hour SLA breach escalations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleRequestPush}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
          >
            🔔 {pushStatus === 'granted' ? 'Web Push Active' : 'Enable Web Push'}
          </button>
          <button
            onClick={loadNotifications}
            className="btn-secondary"
            disabled={loading}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="civic-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading your notification inbox...
        </div>
      ) : notifications.length === 0 ? (
        <div className="civic-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>No Notifications</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            You are all caught up! There are no pending alerts or escalation messages for your account.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((item) => (
            <div
              key={item.id}
              className="civic-card"
              style={{
                padding: '1rem 1.25rem',
                borderLeft: `4px solid ${item.isRead ? 'var(--color-border)' : 'var(--color-primary)'}`,
                backgroundColor: item.isRead ? '#FFFFFF' : '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: item.isRead ? 'var(--color-text-main)' : 'var(--color-primary)' }}>
                      {item.title}
                    </span>
                    {!item.isRead && (
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-sub)', margin: '0 0 0.5rem 0' }}>
                    {item.message}
                  </p>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    {new Date(item.createdAt).toLocaleString()} • Channel: {item.channel.toUpperCase()}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                  {item.complaintId && onSelectComplaint && (
                    <button
                      className="btn-primary"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => onSelectComplaint(item.complaintId!)}
                    >
                      View Case Dossier →
                    </button>
                  )}
                  {!item.isRead && (
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                      onClick={() => handleMarkAsRead(item.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
