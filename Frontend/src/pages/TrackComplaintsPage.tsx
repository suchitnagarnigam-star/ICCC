import React, { useState, useEffect } from 'react';
import { Complaint } from '../types';
import { apiFetch } from '../shared/utils/apiConfig';
import StatusBadge from '../components/StatusBadge';
import ComplaintDetailPage from './ComplaintDetailPage';

interface TrackComplaintsPageProps {
  initialComplaintId?: string | null;
  onClearInitialId?: () => void;
}

export const TrackComplaintsPage: React.FC<TrackComplaintsPageProps> = ({
  initialComplaintId,
  onClearInitialId,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(
    initialComplaintId || null
  );

  useEffect(() => {
    if (initialComplaintId) {
      setActiveComplaintId(initialComplaintId);
    }
  }, [initialComplaintId]);

  useEffect(() => {
    async function loadComplaints() {
      setLoading(true);
      try {
        let query = '/complaints';
        const params = new URLSearchParams();
        if (selectedBranch) params.append('branch', selectedBranch);
        if (selectedStatus) params.append('status', selectedStatus);
        if (params.toString()) query += `?${params.toString()}`;

        const res = await apiFetch(query);
        if (res.success && res.data) {
          setComplaints(res.data);
        }
      } catch (err) {
        console.error('Failed to load complaints', err);
      } finally {
        setLoading(false);
      }
    }
    loadComplaints();
  }, [selectedBranch, selectedStatus]);

  if (activeComplaintId) {
    return (
      <ComplaintDetailPage
        complaintId={activeComplaintId}
        onBack={() => {
          setActiveComplaintId(null);
          if (onClearInitialId) onClearInitialId();
        }}
      />
    );
  }

  const filtered = complaints.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.complaintNumber.toLowerCase().includes(q) ||
      c.complainantName.toLowerCase().includes(q) ||
      c.contactNumber.includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.assignedJeName && c.assignedJeName.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="civic-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="civic-title">Live Complaints Register &amp; Tracking</h1>
          <p className="civic-desc">Real-time status tracking, territorial routing, and 48-hour SLA monitoring across 95 wards.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="civic-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Complaint #, Complainant, Ward, or Officer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select className="form-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
              <option value="">All Branches (O&M, B&R, Health, Light)</option>
              <option value="O&M">O&amp;M (Water &amp; Sewerage)</option>
              <option value="B&R">B&amp;R (Buildings &amp; Roads)</option>
              <option value="Health">Health (Sanitation &amp; GVP)</option>
              <option value="Light">Light (Street Lighting)</option>
            </select>
          </div>
          <div>
            <select className="form-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED (Registered)</option>
              <option value="ASSIGNED">ASSIGNED (Routed)</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLUTION_SUBMITTED">RESOLUTION_SUBMITTED</option>
              <option value="CLOSED">CLOSED (Verified)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          Loading active grievances...
        </div>
      ) : filtered.length === 0 ? (
        <div className="civic-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No grievances found matching the selected filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((c) => {
            const dueMs = new Date(c.dueAt).getTime();
            const diffHours = Math.round((dueMs - Date.now()) / 3600000);
            const isBreached = diffHours < 0 && c.status !== 'CLOSED' && c.status !== 'RESOLUTION_SUBMITTED';

            return (
              <div
                key={c.id}
                onClick={() => setActiveComplaintId(c.id)}
                className="civic-card"
                style={{
                  borderLeft: `5px solid ${isBreached ? 'var(--color-danger)' : 'var(--color-primary)'}`,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s ease, transform 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem' }}>
                      {c.complaintNumber}
                    </span>
                    <strong style={{ color: 'var(--color-text-main)', fontSize: '0.95rem' }}>{c.categoryName}</strong>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      {c.branch}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge status={c.status} size="sm" />
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isBreached ? 'var(--color-danger)' : diffHours <= 12 ? 'var(--color-accent)' : 'var(--color-primary)',
                      }}
                    >
                      ⏱️ {c.status === 'CLOSED' ? 'Closed' : isBreached ? `Breached (-${Math.abs(diffHours)}h)` : `${diffHours}h left`}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-sub)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                  {c.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', paddingTop: '0.65rem', borderTop: '1px solid var(--color-border)' }}>
                  <span>📍 Ward <strong>{c.wardNumber || 'N/A'}</strong> (Zone {c.zone || 'MCL'})</span>
                  <span>👤 Complainant: <strong>{c.complainantName}</strong></span>
                  {c.assignedJeName && (
                    <span>👷 Assigned JE: <strong style={{ color: 'var(--color-primary)' }}>{c.assignedJeName}</strong></span>
                  )}
                  {c.attachments && c.attachments.length > 0 && (
                    <span>📷 Attachments: <strong>{c.attachments.length} photo(s)</strong></span>
                  )}
                  <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: 700 }}>
                    View Dossier &amp; Actions →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackComplaintsPage;
