import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { apiFetch } from '../shared/utils/apiConfig';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ComplaintDetailPage from './ComplaintDetailPage';

interface TrackComplaintsPageProps {
  initialComplaintId?: string | null;
  onClearInitialId?: () => void;
  onNavigateToLogin?: () => void;
}

export const TrackComplaintsPage: React.FC<TrackComplaintsPageProps> = ({
  initialComplaintId,
  onClearInitialId,
  onNavigateToLogin,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'public' | 'registry'>(
    isAuthenticated ? 'registry' : 'public'
  );

  // Active detail page state
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(
    initialComplaintId || null
  );

  // Public Quick Tracking State
  const [publicComplaintNumber, setPublicComplaintNumber] = useState('');
  const [publicContactNumber, setPublicContactNumber] = useState('');
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicResult, setPublicResult] = useState<any | null>(null);
  const [publicError, setPublicError] = useState<string | null>(null);

  // Operational Registry State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryError, setRegistryError] = useState<string | null>(null);

  useEffect(() => {
    if (initialComplaintId) {
      setActiveComplaintId(initialComplaintId);
    }
  }, [initialComplaintId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRegistryComplaints();
    }
  }, [selectedBranch, selectedStatus, selectedZone, isAuthenticated]);

  async function loadRegistryComplaints() {
    setRegistryLoading(true);
    setRegistryError(null);
    try {
      let query = '/complaints';
      const params = new URLSearchParams();
      if (selectedBranch) params.append('branch', selectedBranch);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedZone) params.append('zone', selectedZone);
      if (params.toString()) query += `?${params.toString()}`;

      const res = await apiFetch(query);
      if (res.success && res.data) {
        setComplaints(res.data);
      } else {
        setComplaints([]);
      }
    } catch (err: any) {
      setRegistryError(err.message || 'Failed to load complaints registry.');
    } finally {
      setRegistryLoading(false);
    }
  }

  const handlePublicTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicComplaintNumber.trim() || !publicContactNumber.trim()) {
      setPublicError('Please provide both the Complaint Number and 10-digit Mobile Number.');
      return;
    }

    setPublicLoading(true);
    setPublicError(null);
    setPublicResult(null);

    try {
      const res = await apiFetch('/complaints/track', {
        method: 'POST',
        body: JSON.stringify({
          complaintNumber: publicComplaintNumber.trim(),
          contactNumber: publicContactNumber.trim(),
        }),
      });

      if (res.success && res.data) {
        setPublicResult(res.data);
      } else {
        setPublicError(res.error || 'No matching grievance found with those details.');
      }
    } catch (err: any) {
      setPublicError(err.message || 'Unable to track grievance. Please verify details.');
    } finally {
      setPublicLoading(false);
    }
  };

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
      (c.complainantName && c.complainantName.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.categoryName && c.categoryName.toLowerCase().includes(q)) ||
      (c.assignedJeName && c.assignedJeName.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="civic-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="civic-title">Civic Grievance Tracking &amp; Registry</h1>
        <p className="civic-desc">
          Official Municipal Corporation Ludhiana portal for grievance verification, 48-hour working SLA tracking, and resolution monitoring.
        </p>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('public')}
            className={`btn-secondary ${activeTab === 'public' ? 'active' : ''}`}
            style={{
              padding: '0.45rem 1rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              backgroundColor: activeTab === 'public' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'public' ? '#FFFFFF' : 'var(--color-text-main)',
              borderColor: activeTab === 'public' ? 'var(--color-primary)' : 'var(--color-border)',
            }}
          >
            🔍 Public Quick Tracker
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`btn-secondary ${activeTab === 'registry' ? 'active' : ''}`}
            style={{
              padding: '0.45rem 1rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              backgroundColor: activeTab === 'registry' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'registry' ? '#FFFFFF' : 'var(--color-text-main)',
              borderColor: activeTab === 'registry' ? 'var(--color-primary)' : 'var(--color-border)',
            }}
          >
            📋 {isAuthenticated ? (user?.role === 'citizen' ? 'My Grievances' : 'Complaints Registry') : 'Authorized Registry'}
          </button>
        </div>
      </div>

      {/* Mode A: Public Quick Tracker */}
      {activeTab === 'public' && (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="civic-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span className="brand-badge">PUBLIC VERIFICATION</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--color-primary)' }}>
                Track Your Grievance Real-Time
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Enter your MCL Complaint Number (e.g. MCL-2026-0985) and the 10-digit mobile number provided during filing.
              </p>
            </div>

            {publicError && (
              <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                {publicError}
              </div>
            )}

            <form onSubmit={handlePublicTrack}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Complaint Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="MCL-2026-XXXX"
                    value={publicComplaintNumber}
                    onChange={(e) => setPublicComplaintNumber(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Registered Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit number"
                    maxLength={10}
                    value={publicContactNumber}
                    onChange={(e) => setPublicContactNumber(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700 }}
                disabled={publicLoading}
              >
                {publicLoading ? 'Locating Record...' : 'Verify Status & SLA Timeline'}
              </button>
            </form>
          </div>

          {/* Public Track Result Card */}
          {publicResult && (
            <div className="civic-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Official Complaint Dossier
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '2px 0 0 0', fontFamily: 'var(--font-mono)' }}>
                    {publicResult.complaintNumber}
                  </h3>
                </div>
                <StatusBadge status={publicResult.status as ComplaintStatus} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Assigned Department</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{publicResult.branch || 'Pending'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Jurisdiction</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Ward {publicResult.wardNumber || 'N/A'} (Zone {publicResult.zone || 'N/A'})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Intake Date</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {publicResult.submittedAt ? new Date(publicResult.submittedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>48h Working SLA Due</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: publicResult.slaBreached ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {publicResult.dueAt ? new Date(publicResult.dueAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Assigned Junior Engineer */}
              {publicResult.assignedJeName && (
                <div style={{ padding: '0.85rem 1rem', backgroundColor: '#EFF6FF', borderRadius: '6px', border: '1px solid #BFDBFE', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 600 }}>Field Junior Engineer in Charge</div>
                    <div style={{ fontWeight: 800, color: '#1E3A8A' }}>{publicResult.assignedJeName}</div>
                  </div>
                  {publicResult.assignedJePhone && (
                    <a
                      href={`tel:${publicResult.assignedJePhone}`}
                      className="btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none' }}
                    >
                      📞 Call Officer: {publicResult.assignedJePhone}
                    </a>
                  )}
                </div>
              )}

              {/* Sanitized Progress Timeline */}
              {publicResult.timeline && publicResult.timeline.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                    Official Progress Trail
                  </h4>
                  <div style={{ borderLeft: '2px solid var(--color-border)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
                    {publicResult.timeline.map((event: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '1rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-1.35rem', top: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{event.action}</span>
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            {event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}
                          </span>
                        </div>
                        {event.notes && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', marginTop: '2px' }}>
                            {event.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', textAlign: 'right' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setActiveComplaintId(publicResult.id)}
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                  >
                    Open Complete Case Dossier →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode B: Authorized Complaints Registry / My Grievances */}
      {activeTab === 'registry' && (
        <div>
          {!isAuthenticated ? (
            <div className="civic-card" style={{ maxWidth: '580px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem' }}>
              <span className="brand-badge">AUTHENTICATION REQUIRED</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0', color: 'var(--color-primary)' }}>
                Access Authorized Grievances Registry
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Citizens can view all their filed and claimed grievances. Municipal staff can view territory-scoped operational complaints.
              </p>
              <button
                className="btn-primary"
                onClick={onNavigateToLogin || (() => {})}
                style={{ padding: '0.65rem 1.5rem', fontWeight: 700 }}
              >
                Sign In to View Registry →
              </button>
            </div>
          ) : (
            <div>
              {/* Filter Controls */}
              <div className="civic-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search complaint #, description, ward..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <select
                      className="form-select"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                      <option value="">All Branches</option>
                      <option value="O&M">O&amp;M (Water &amp; Sewer)</option>
                      <option value="B&R">B&amp;R (Roads &amp; Bridges)</option>
                      <option value="Health">Health &amp; Sanitation</option>
                      <option value="Light">Street Lighting</option>
                    </select>
                  </div>
                  <div>
                    <select
                      className="form-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="SUBMITTED">Registered (Submitted)</option>
                      <option value="ASSIGNED">Assigned to Officer</option>
                      <option value="ACKNOWLEDGED">Acknowledged</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLUTION_SUBMITTED">Resolution Submitted</option>
                      <option value="CLOSED">Closed &amp; Verified</option>
                    </select>
                  </div>
                  <div>
                    <select
                      className="form-select"
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                    >
                      <option value="">All Zones</option>
                      <option value="A">Zone A</option>
                      <option value="B">Zone B</option>
                      <option value="C">Zone C</option>
                      <option value="D">Zone D</option>
                    </select>
                  </div>
                </div>
              </div>

              {registryError && (
                <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  {registryError}
                </div>
              )}

              {/* Complaints Table */}
              <div className="civic-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    Active Records ({filtered.length})
                  </span>
                  <button
                    onClick={loadRegistryComplaints}
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                    disabled={registryLoading}
                  >
                    {registryLoading ? 'Refreshing...' : '🔄 Refresh Data'}
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Complaint #</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Category &amp; Branch</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Territory</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Assigned JE</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>SLA Target</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registryLoading ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            Loading registry complaints from PostgreSQL...
                          </td>
                        </tr>
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                            No complaints found matching the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item) => (
                          <tr
                            key={item.id}
                            style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                            onClick={() => setActiveComplaintId(item.id)}
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
                                  color: item.isPaused ? '#B45309' : item.slaBreached ? 'var(--color-danger)' : 'var(--color-success)',
                                }}
                              >
                                {item.isPaused ? '⏸️ Paused' : item.slaBreached ? '⚠️ Breached' : '✓ Active'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                              <button
                                className="btn-secondary"
                                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveComplaintId(item.id);
                                }}
                              >
                                View Dossier →
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
          )}
        </div>
      )}
    </div>
  );
};

export default TrackComplaintsPage;
