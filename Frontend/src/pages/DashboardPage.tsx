import React, { useState, useEffect } from 'react';
import { Complaint, DepartmentBranch } from '../types';
import { apiFetch } from '../shared/utils/apiConfig';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

interface DashboardPageProps {
  onSelectComplaint: (id: string) => void;
  onNavigateToRegistry: (branch?: string, status?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectComplaint,
  onNavigateToRegistry,
}) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/complaints?limit=250');
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load command center metrics.');
    } finally {
      setLoading(false);
    }
  }

  // Calculate high-level KPIs
  const total = complaints.length;
  const inProgress = complaints.filter(
    (c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED' || c.status === 'ACKNOWLEDGED'
  ).length;
  const resolutionSubmitted = complaints.filter((c) => c.status === 'RESOLUTION_SUBMITTED').length;
  const closed = complaints.filter((c) => c.status === 'CLOSED').length;
  const breached = complaints.filter(
    (c) => c.slaBreached && c.status !== 'CLOSED' && c.status !== 'RESOLUTION_SUBMITTED'
  ).length;

  const nowMs = Date.now();
  const atRisk = complaints.filter((c) => {
    if (c.status === 'CLOSED' || c.status === 'RESOLUTION_SUBMITTED' || c.slaBreached) return false;
    const dueMs = new Date(c.dueAt).getTime();
    const diffHours = (dueMs - nowMs) / 3600000;
    return diffHours > 0 && diffHours <= 12;
  }).length;

  // Department counts
  const branchCounts: Record<DepartmentBranch, number> = {
    'O&M': complaints.filter((c) => c.branch === 'O&M' && c.status !== 'CLOSED').length,
    'B&R': complaints.filter((c) => c.branch === 'B&R' && c.status !== 'CLOSED').length,
    'Health': complaints.filter((c) => c.branch === 'Health' && c.status !== 'CLOSED').length,
    'Light': complaints.filter((c) => c.branch === 'Light' && c.status !== 'CLOSED').length,
  };

  // Zone counts
  const zoneCounts: Record<string, number> = {
    'Zone A': complaints.filter((c) => c.zone === 'A' && c.status !== 'CLOSED').length,
    'Zone B': complaints.filter((c) => c.zone === 'B' && c.status !== 'CLOSED').length,
    'Zone C': complaints.filter((c) => c.zone === 'C' && c.status !== 'CLOSED').length,
    'Zone D': complaints.filter((c) => c.zone === 'D' && c.status !== 'CLOSED').length,
  };

  // Urgent attention list (Breached or Unacknowledged)
  const urgentQueue = complaints
    .filter((c) => c.status !== 'CLOSED')
    .sort((a, b) => {
      if (a.slaBreached && !b.slaBreached) return -1;
      if (!a.slaBreached && b.slaBreached) return 1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    })
    .slice(0, 8);

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="brand-badge">CONTROL ROOM</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Operational Scope: {user?.role?.toUpperCase()} {user?.branch ? `(${user.branch})` : ''} {user?.zone ? `Zone ${user.zone}` : ''}
            </span>
          </div>
          <h1 className="civic-title" style={{ marginTop: '0.4rem' }}>
            Integrated Command &amp; Control Center Dashboard
          </h1>
          <p className="civic-desc">
            Live municipal oversight, 48-working-hour SLA breach monitoring, and inter-departmental dispatch.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="btn-secondary"
          disabled={loading}
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Metrics'}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="civic-card" style={{ padding: '1.25rem', borderTop: '3px solid var(--color-primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Active</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: '4px' }}>{total}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Registered grievances</div>
        </div>

        <div className="civic-card" style={{ padding: '1.25rem', borderTop: '3px solid #2563EB' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>In Progress</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2563EB', marginTop: '4px' }}>{inProgress}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Crews deployed on-site</div>
        </div>

        <div className="civic-card" style={{ padding: '1.25rem', borderTop: '3px solid #D97706' }}>
          <div style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>SLA At Risk</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', marginTop: '4px' }}>{atRisk}</div>
          <div style={{ fontSize: '0.72rem', color: '#B45309', marginTop: '2px' }}>&lt; 12 hours remaining</div>
        </div>

        <div className="civic-card" style={{ padding: '1.25rem', borderTop: '3px solid #DC2626' }}>
          <div style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 700, textTransform: 'uppercase' }}>SLA Breached</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>{breached}</div>
          <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '2px' }}>Overdue &gt; 48 hours</div>
        </div>

        <div className="civic-card" style={{ padding: '1.25rem', borderTop: '3px solid #0D9488' }}>
          <div style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 700, textTransform: 'uppercase' }}>Under Review</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0D9488', marginTop: '4px' }}>{resolutionSubmitted}</div>
          <div style={{ fontSize: '0.72rem', color: '#0D9488', marginTop: '2px' }}>Awaiting verification</div>
        </div>

        <div className="civic-card" style={{ padding: '1.25rem', borderTop: '3px solid #059669' }}>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>Closed &amp; Met</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>{closed}</div>
          <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>Fully verified</div>
        </div>
      </div>

      {/* Grid: Departments + Territorial Zones */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Department Breakdown */}
        <div className="civic-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Departmental Workload</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Active cases</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => onNavigateToRegistry('O&M')}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>💧 Operations &amp; Maintenance (O&amp;M)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Water supply, sewer lines, manholes</div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{branchCounts['O&M']}</div>
            </div>

            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => onNavigateToRegistry('B&R')}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>🛣️ Building &amp; Roads (B&amp;R)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Potholes, road gullies, asphalt repairs</div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{branchCounts['B&R']}</div>
            </div>

            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => onNavigateToRegistry('Health')}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>🧹 Health &amp; Sanitation</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>GVP garbage points, tree fall removal</div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{branchCounts['Health']}</div>
            </div>

            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => onNavigateToRegistry('Light')}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>💡 Street Lighting</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Faulty lamps, dark poles, loose wiring</div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>{branchCounts['Light']}</div>
            </div>
          </div>
        </div>

        {/* Zone Distribution */}
        <div className="civic-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Territorial Distribution (Zones A–D)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>95 Municipal Wards</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(zoneCounts).map(([zoneName, count]) => {
              const maxZone = Math.max(...Object.values(zoneCounts), 1);
              const pct = Math.round((count / maxZone) * 100);

              return (
                <div key={zoneName} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700 }}>{zoneName}</span>
                    <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{count} active</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--color-accent)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority Action Queue Table */}
      <div className="civic-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              ⚠️ SLA Priority Attention Queue
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
              Complaints requiring immediate dispatch or verification
            </span>
          </div>
          <button
            onClick={() => onNavigateToRegistry()}
            className="btn-secondary"
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
          >
            View Full Registry →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Complaint #</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Branch &amp; Category</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Territory</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Assigned JE</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>SLA Urgency</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {urgentQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No urgent grievances pending action.
                  </td>
                </tr>
              ) : (
                urgentQueue.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                    onClick={() => onSelectComplaint(item.id)}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {item.complaintNumber}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.categoryName || item.categoryId}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{item.branch}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div>Ward {item.wardNumber || 'N/A'}</div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Zone {item.zone || 'N/A'}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.assignedJeName || 'Unassigned'}</div>
                      {item.assignedJePhone && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{item.assignedJePhone}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: item.slaBreached ? '#FEE2E2' : '#FEF3C7',
                          color: item.slaBreached ? '#DC2626' : '#B45309',
                        }}
                      >
                        {item.slaBreached ? '⚠️ Breached' : '⏳ Approaching Target'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(item.id);
                        }}
                      >
                        Open Case →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
