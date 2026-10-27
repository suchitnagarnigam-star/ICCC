import React, { useState, useEffect } from 'react';
import { Complaint } from '../types';
import { apiFetch } from '../shared/utils/apiConfig';
import StatusBadge from '../components/StatusBadge';
import ImageViewerModal from '../components/ImageViewerModal';

interface ComplaintDetailPageProps {
  complaintId: string;
  onBack: () => void;
}

const TIMELINE_STAGES = [
  { label: 'Registered', key: 'SUBMITTED' },
  { label: 'Assigned', key: 'ASSIGNED' },
  { label: 'In Progress', key: 'IN_PROGRESS' },
  { label: 'Resolution Submitted', key: 'RESOLUTION_SUBMITTED' },
  { label: 'Closed / Verified', key: 'CLOSED' },
];

function getStageIndex(status: string): number {
  const norm = (status || '').toUpperCase();
  if (norm === 'SUBMITTED' || norm === 'NEEDS_REVIEW') return 0;
  if (norm === 'ASSIGNED' || norm === 'ACKNOWLEDGED') return 1;
  if (norm === 'IN_PROGRESS' || norm === 'WAITING_FOR_INFORMATION') return 2;
  if (norm === 'RESOLUTION_SUBMITTED' || norm === 'UNDER_REVIEW') return 3;
  if (norm === 'CLOSED') return 4;
  return 0;
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ComplaintDetailPage: React.FC<ComplaintDetailPageProps> = ({
  complaintId,
  onBack,
}) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'evidence' | 'actions'>('overview');

  // Modal lightbox state
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; fileName: string } | null>(null);

  // Action Console state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [reassignName, setReassignName] = useState('');
  const [reassignPhone, setReassignPhone] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [verifyRating, setVerifyRating] = useState('5');
  const [verifyFeedback, setVerifyFeedback] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [complaintId]);

  async function loadComplaint() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/complaints/${complaintId}`);
      if (res.success && res.data) {
        setComplaint(res.data);
      } else {
        setError(res.error || 'Failed to load complaint details.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setLoading(false);
    }
  }

  const handleCopyId = () => {
    if (!complaint) return;
    navigator.clipboard.writeText(complaint.complaintNumber);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleAcknowledge = async () => {
    if (!complaint) return;
    setActionLoading(true);
    setActionSuccess(null);
    try {
      const res = await apiFetch(`/complaints/${complaint.id}/acknowledge`, {
        method: 'POST',
        body: JSON.stringify({ officerName: complaint.assignedJeName }),
      });
      if (res.success) {
        setActionSuccess('Assignment successfully acknowledged.');
        await loadComplaint();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to acknowledge.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (targetStatus: string, remarks: string) => {
    if (!complaint) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/complaints/${complaint.id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: targetStatus, remarks }),
      });
      if (res.success) {
        setActionSuccess(`Status updated to ${targetStatus}`);
        await loadComplaint();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !resolutionNotes.trim()) return;
    setActionLoading(true);
    setActionSuccess(null);
    try {
      const res = await apiFetch(`/complaints/${complaint.id}/resolution`, {
        method: 'POST',
        body: JSON.stringify({ resolutionNotes }),
      });
      if (res.success) {
        setActionSuccess('Resolution report submitted successfully.');
        setResolutionNotes('');
        await loadComplaint();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit resolution.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !reassignName.trim()) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/complaints/${complaint.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          officerName: reassignName,
          officerPhone: reassignPhone,
          reason: reassignReason,
        }),
      });
      if (res.success) {
        setActionSuccess(`Successfully reassigned to ${reassignName}.`);
        setReassignName('');
        setReassignPhone('');
        setReassignReason('');
        await loadComplaint();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reassign.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/complaints/${complaint.id}/verify-close`, {
        method: 'POST',
        body: JSON.stringify({
          rating: parseInt(verifyRating, 10),
          feedback: verifyFeedback,
        }),
      });
      if (res.success) {
        setActionSuccess('Grievance marked as closed and verified.');
        await loadComplaint();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to verify.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading grievance record details...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="civic-card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--color-danger)' }}>Record Not Found</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{error || 'Unable to retrieve complaint.'}</p>
        <button className="btn-secondary" onClick={onBack}>← Back to Complaints Register</button>
      </div>
    );
  }

  // Calculate SLA countdown
  const nowMs = Date.now();
  const dueMs = new Date(complaint.dueAt).getTime();
  const diffHours = Math.round((dueMs - nowMs) / 3600000);
  const isBreached = diffHours < 0 && complaint.status !== 'CLOSED' && complaint.status !== 'RESOLUTION_SUBMITTED';

  const currentStage = getStageIndex(complaint.status);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Lightbox Modal */}
      {lightboxImage && (
        <ImageViewerModal
          isOpen={true}
          imageUrl={lightboxImage.url}
          title={lightboxImage.title}
          fileName={lightboxImage.fileName}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* Top Navigation & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
          }}
        >
          ← Back to Live Register
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {complaint.assignedJePhone && (
            <a
              href={`tel:${complaint.assignedJePhone}`}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', textDecoration: 'none' }}
            >
              📞 Call Assigned JE
            </a>
          )}
          <button
            onClick={() => window.print()}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            🖨️ Print Dossier
          </button>
        </div>
      </div>

      {/* Primary Header Card */}
      <div className="civic-card" style={{ marginBottom: '1.25rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-mono)' }}>
                {complaint.complaintNumber}
              </h1>
              <button
                onClick={handleCopyId}
                style={{
                  background: copiedId ? '#22c55e' : 'var(--color-border)',
                  color: copiedId ? '#fff' : 'var(--color-text)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {copiedId ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Branch:</span>
              <strong style={{ color: 'var(--color-primary)' }}>{complaint.branch} Branch</strong>
              <span style={{ color: 'var(--color-border)' }}>•</span>
              <span style={{ color: 'var(--color-text-muted)' }}>Category:</span>
              <strong>{complaint.categoryName}</strong>
              <span style={{ color: 'var(--color-border)' }}>•</span>
              <span style={{ color: 'var(--color-text-muted)' }}>Channel:</span>
              <span>{complaint.mode}</span>
            </div>
          </div>

          {/* Right Status & SLA block */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <StatusBadge status={complaint.status} size="lg" />

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: isBreached ? '#fee2e2' : diffHours <= 12 ? '#fef3c7' : '#e0f2fe',
                color: isBreached ? '#b91c1c' : diffHours <= 12 ? '#b45309' : '#0369a1',
                border: `1px solid ${isBreached ? '#fca5a5' : diffHours <= 12 ? '#fde68a' : '#bae6fd'}`,
              }}
            >
              ⏱️ {complaint.status === 'CLOSED'
                ? 'SLA Met (Closed)'
                : isBreached
                ? `SLA Breached by ${Math.abs(diffHours)}h`
                : `${diffHours}h Remaining (48h Target)`}
            </div>
          </div>
        </div>

        {/* 5-Stage Visual Progress Stepper */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', position: 'relative' }}>
            {TIMELINE_STAGES.map((stage, idx) => {
              const isPast = idx < currentStage;
              const isCurrent = idx === currentStage;

              return (
                <div key={stage.key} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      margin: '0 auto 8px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      backgroundColor: isPast ? 'var(--color-success)' : isCurrent ? 'var(--color-primary)' : 'var(--color-border)',
                      color: isPast || isCurrent ? '#ffffff' : 'var(--color-text-muted)',
                      border: isCurrent ? '3px solid #93c5fd' : 'none',
                    }}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: isCurrent ? 800 : 600,
                      color: isCurrent ? 'var(--color-primary)' : isPast ? 'var(--color-text)' : 'var(--color-text-muted)',
                    }}
                  >
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '2px' }}>
        {[
          { key: 'overview', label: '📌 Overview & Territory' },
          { key: 'timeline', label: `⏱️ Audit Trail (${complaint.timeline?.length || 0})` },
          { key: 'evidence', label: `📷 Evidence Gallery (${(complaint.attachments?.length || 0) + (complaint.resolutionProof?.length || 0)})` },
          { key: 'actions', label: '⚙️ Work Console & Actions' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === tab.key ? '3px solid var(--color-primary)' : '3px solid transparent',
              marginBottom: '-5px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Success Toast */}
      {actionSuccess && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', fontWeight: 600, border: '1px solid #bbf7d0' }}>
          ✓ {actionSuccess}
        </div>
      )}

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.25rem' }}>
          {/* Left Column: Complaint Details & Citizen Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="civic-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-primary)' }}>
                Citizen Grievance Description
              </h3>
              <p style={{ lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--color-text)', whiteSpace: 'pre-wrap', margin: 0 }}>
                {complaint.description}
              </p>
            </div>

            <div className="civic-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-primary)' }}>
                Location &amp; Administrative Territory
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Ward Number</span>
                  <strong>{complaint.wardNumber ? `Ward ${complaint.wardNumber}` : 'Unassigned Ward'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Zone Jurisdiction</span>
                  <strong>{complaint.zone ? `Zone ${complaint.zone} (MCL)` : 'Pending Zone'}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Physical Address</span>
                  <span>{complaint.address || 'Address details not provided'}</span>
                </div>
                {complaint.landmark && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Prominent Landmark</span>
                    <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{complaint.landmark}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="civic-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-primary)' }}>
                Complainant Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Name</span>
                  <strong>{complaint.complainantName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Contact Phone</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{complaint.contactNumber}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Submission Mode</span>
                  <span>{complaint.mode}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.8rem' }}>Registered At</span>
                  <span>{new Date(complaint.submittedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Assigned Officer Profile Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="civic-card" style={{ borderTop: '4px solid var(--color-primary)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-primary)' }}>
                Assigned Field Officer
              </h3>

              {complaint.assignedJeName ? (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{complaint.assignedJeName}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Designated Junior Engineer • {complaint.branch} Branch
                    </span>
                  </div>

                  {complaint.assignedJePhone && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      <a
                        href={`tel:${complaint.assignedJePhone}`}
                        className="btn-primary"
                        style={{ flex: 1, textAlign: 'center', padding: '0.5rem', textDecoration: 'none', fontSize: '0.85rem' }}
                      >
                        📞 Call ({complaint.assignedJePhone})
                      </a>
                      <a
                        href={`https://wa.me/91${complaint.assignedJePhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ padding: '0.5rem 0.85rem', textDecoration: 'none', fontSize: '0.85rem' }}
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Acknowledgment:</span>
                      {complaint.assignmentAcknowledgedAt ? (
                        <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                          ✓ {new Date(complaint.assignmentAcknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span style={{ color: '#d97706', fontWeight: 700 }}>⏳ Pending Response</span>
                      )}
                    </div>

                    {complaint.sdoName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Supervising SDO:</span>
                        <strong>{complaint.sdoName}</strong>
                      </div>
                    )}

                    {complaint.xenName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Executive Engineer (XEN):</span>
                        <strong>{complaint.xenName}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '6px', color: '#b45309', fontSize: '0.88rem' }}>
                  ⚠️ No primary officer assigned yet. Grievance flagged for manual Control Room review.
                </div>
              )}
            </div>

            {/* Resolution Summary Card if resolved */}
            {complaint.resolutionNotes && (
              <div className="civic-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-success)', margin: '0 0 0.5rem 0' }}>
                  Work Resolution Summary
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5', color: 'var(--color-text)' }}>
                  {complaint.resolutionNotes}
                </p>
                {complaint.resolvedAt && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                    Submitted on {new Date(complaint.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Timeline */}
      {activeTab === 'timeline' && (
        <div className="civic-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            Immutable Audit Trail &amp; Lifecycle Events
          </h3>

          {(!complaint.timeline || complaint.timeline.length === 0) ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No audit events logged.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.5rem' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '6px', width: '2px', backgroundColor: 'var(--color-border)' }} />

              {complaint.timeline.map((evt) => (
                <div key={evt.id} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.85rem',
                      top: '4px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      border: '2px solid #fff',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--color-text)' }}>{evt.action}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                    By <strong style={{ color: 'var(--color-primary)' }}>{evt.actorName}</strong> ({evt.actorRole})
                  </div>
                  {evt.notes && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', backgroundColor: 'var(--color-bg)', padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                      {evt.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Evidence Gallery */}
      {activeTab === 'evidence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Citizen Initial Intake Photos */}
          <div className="civic-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-primary)' }}>
              Citizen Initial Evidence ({complaint.attachments?.length || 0})
            </h3>
            {(!complaint.attachments || complaint.attachments.length === 0) ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                No initial photo attachments were uploaded by citizen during registration.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {complaint.attachments.map((file) => (
                  <div
                    key={file.fileId}
                    onClick={() =>
                      setLightboxImage({
                        url: file.fileUrl,
                        title: `Initial Evidence: ${file.fileName}`,
                        fileName: file.fileName,
                      })
                    }
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      backgroundColor: 'var(--color-bg)',
                    }}
                  >
                    <div style={{ height: '120px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={file.fileUrl}
                        alt={file.fileName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as any).style.display = 'none';
                        }}
                      />
                    </div>
                    <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.fileName}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)' }}>{formatBytes(file.size)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Officer Resolution Completion Photos */}
          <div className="civic-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-success)' }}>
              Field Resolution Proof Photos ({complaint.resolutionProof?.length || 0})
            </h3>
            {(!complaint.resolutionProof || complaint.resolutionProof.length === 0) ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Resolution proof photos have not yet been uploaded by field team.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {complaint.resolutionProof.map((file) => (
                  <div
                    key={file.fileId}
                    onClick={() =>
                      setLightboxImage({
                        url: file.fileUrl,
                        title: `Resolution Proof: ${file.fileName}`,
                        fileName: file.fileName,
                      })
                    }
                    style={{
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      backgroundColor: '#f0fdf4',
                    }}
                  >
                    <div style={{ height: '120px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={file.fileUrl}
                        alt={file.fileName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as any).style.display = 'none';
                        }}
                      />
                    </div>
                    <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem' }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.fileName}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)' }}>{formatBytes(file.size)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Work Console & Actions */}
      {activeTab === 'actions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Field Staff Console */}
          <div className="civic-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-primary)' }}>
              Field Officer Actions (JE / CSI)
            </h3>

            {/* Acknowledge Button */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>1. Assignment Acknowledgment</h4>
              {complaint.assignmentAcknowledgedAt ? (
                <div style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ Acknowledged on {new Date(complaint.assignmentAcknowledgedAt).toLocaleString()}
                </div>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleAcknowledge}
                  disabled={actionLoading}
                  style={{ width: '100%' }}
                >
                  {actionLoading ? 'Acknowledging...' : 'Acknowledge Assignment Now'}
                </button>
              )}
            </div>

            {/* Quick Status Buttons */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>2. Update Status</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleStatusChange('IN_PROGRESS', 'Field machinery and team dispatched.')}
                  disabled={actionLoading || complaint.status === 'IN_PROGRESS'}
                >
                  Set In Progress
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleStatusChange('WAITING_FOR_INFORMATION', 'Awaiting citizen address clarification.')}
                  disabled={actionLoading}
                >
                  Waiting Info
                </button>
              </div>
            </div>

            {/* Submit Resolution Form */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>3. Submit Resolution Report</h4>
              <form onSubmit={handleSubmitResolution}>
                <textarea
                  className="form-textarea"
                  placeholder="Describe resolution work performed (e.g. Patch work laid, drain cleared, light repaired)..."
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  required
                  style={{ marginBottom: '0.75rem' }}
                />
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={actionLoading}>
                  {actionLoading ? 'Submitting...' : 'Submit Resolution'}
                </button>
              </form>
            </div>
          </div>

          {/* Supervisor / Control Room Console */}
          <div className="civic-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-primary)' }}>
              Supervisor &amp; Control Room Actions
            </h3>

            {/* Verification and Closure */}
            {complaint.status === 'RESOLUTION_SUBMITTED' && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-success)' }}>
                  Verify Resolution &amp; Close Grievance
                </h4>
                <form onSubmit={handleVerifyClose}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>Citizen Satisfaction (1-5)</label>
                    <select className="form-select" value={verifyRating} onChange={(e) => setVerifyRating(e.target.value)}>
                      <option value="5">5 - Highly Satisfied</option>
                      <option value="4">4 - Satisfied</option>
                      <option value="3">3 - Neutral</option>
                      <option value="2">2 - Unsatisfied</option>
                      <option value="1">1 - Highly Unsatisfied</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Citizen verification feedback or QC remarks..."
                      value={verifyFeedback}
                      onChange={(e) => setVerifyFeedback(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', backgroundColor: 'var(--color-success)' }} disabled={actionLoading}>
                    Verify &amp; Permanently Close
                  </button>
                </form>
              </div>
            )}

            {/* Reassignment Form */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Reassign Grievance</h4>
              <form onSubmit={handleReassign}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="New Officer Name (e.g. Vikas Kumar JE)..."
                    value={reassignName}
                    onChange={(e) => setReassignName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Officer Contact Number..."
                    value={reassignPhone}
                    onChange={(e) => setReassignPhone(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Reason for reassignment..."
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-secondary" style={{ width: '100%' }} disabled={actionLoading}>
                  {actionLoading ? 'Reassigning...' : 'Reassign Officer'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetailPage;
