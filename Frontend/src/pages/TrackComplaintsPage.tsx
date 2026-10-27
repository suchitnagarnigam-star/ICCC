import React, { useState, useEffect } from 'react';
import { Complaint } from '../types';
import { apiFetch } from '../shared/utils/apiConfig';

export const TrackComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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

  const filtered = complaints.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.complaintNumber.toLowerCase().includes(q) ||
      c.complainantName.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="civic-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="civic-title">Live Complaints Register &amp; Tracking</h1>
          <p className="civic-desc">Real-time status tracking across Ludhiana wards and municipal branches.</p>
        </div>
      </div>

      <div className="civic-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Complaint #, Complainant, or Keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select className="form-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
              <option value="">All Branches</option>
              <option value="O&M">O&amp;M (Water &amp; Sewerage)</option>
              <option value="B&R">B&amp;R (Buildings &amp; Roads)</option>
              <option value="Health">Health (Sanitation &amp; GVP)</option>
              <option value="Light">Light (Street Lighting)</option>
            </select>
          </div>
          <div>
            <select className="form-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLUTION_SUBMITTED">RESOLUTION_SUBMITTED</option>
              <option value="CLOSED">CLOSED</option>
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
          {filtered.map((c) => (
            <div key={c.id} className="civic-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)', marginRight: '0.75rem' }}>
                    {c.complaintNumber}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{c.categoryName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>({c.branch})</span>
                </div>
                <span className={`status-badge status-${c.status}`}>{c.status}</span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-sub)', marginBottom: '0.75rem' }}>{c.description}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                <span>📍 Ward: <strong>{c.wardNumber || 'Unassigned'}</strong> (Zone {c.zone || 'N/A'})</span>
                <span>👤 Citizen: <strong>{c.complainantName}</strong> ({c.contactNumber})</span>
                {c.assignedJeName && <span>👷 Assigned JE: <strong>{c.assignedJeName}</strong></span>}
                <span>⏱️ Due: <strong>{new Date(c.dueAt).toLocaleDateString()}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

