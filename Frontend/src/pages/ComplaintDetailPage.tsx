import React, { useState, useEffect } from 'react';
import { Complaint } from '../types';
import { apiFetch } from '../shared/utils/apiConfig';
import StatusBadge from '../components/StatusBadge';
import ImageViewerModal from '../components/ImageViewerModal';

interface ComplaintDetailPageProps {
  complaintId: string;
  onBack: () => void;
  onRefresh?: () => void;
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
  onRefresh,
}) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'dossier' | 'evidence' | 'timeline'>('dossier');

  // Modal lightbox state
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; fileName: string } | null>(null);

  // Action Console state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [reassignName, setReassignName] = useState('');
  const [reassignPhone, setReassignPhone] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [verifyRating, setVerifyRating] = useState('5');
  const [verifyFeedback, setVerifyFeedback] = useState('');
  const [pauseReason, setPauseReason] = useState('');
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
    setActionError(null);
    try {
      const res = await apiFetch(`/complaints/${complaint.id}/acknowledge`, {
        method: 'POST',
        body: JSON.stringify({ officerName: complaint.assignedJeName }),
      });
      if (res.success) {
        setActionSuccess('Assignment successfully acknowledged.');
        await loadComplaint();
        onRefresh?.();
      } else {
        setActionError(res.error || 'Failed to acknowledge.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to acknowledge.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (targetStatus: string, remarks: string) => {
    if (!complaint) return;
    setActionLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await apiFetch(`/complaints/${complaint.id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: targetStatus, remarks }),
      });
      if (res.success) {
        setActionSuccess(`Status updated to ${targetStatus}`);
        await loadComplaint();
        onRefresh?.();
      } else {
        setActionError(res.error || 'Failed to update status.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error updating status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    if (proofFiles.length === 0) {
      setActionError('At least one on-site photographic evidence file is mandatory to submit resolution.');
      return;
    }

    setActionLoading(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const formData = new FormData();
      formData.append('resolutionNotes', resolutionNotes);
      proofFiles.forEach((file) => {
        formData.append('resolutionProof', file);
      });

      const token = localStorage.getItem('mcl_iccc_token');
      const response = await fetch(`/api/complaints/${complaint.id}/resolve`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const res = await response.json();
      if (res.success) {
        setActionSuccess('Resolution evidence submitted successfully. Case is now under verification.');
        setResolutionNotes('');
        setProofFiles([]);
        await loadComplaint();
        onRefresh?.();
      } else {
        setActionError(res.error || 'Failed to submit resolution.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error submitting resolution.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyClosure = async (verdict: 'accepted' | 'disputed') => {
    if (!complaint) return;
    setActionLoading(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await apiFetch(`/complaints/${complaint.id}/verify-closure`, {
        method: 'POST',
        body: JSON.stringify({
          verdict,
          rating: parseInt(verifyRating, 10),
          feedback: verifyFeedback,
        }),
      });

      if (res.success) {
        setActionSuccess(
          verdict === 'accepted'
            ? 'Resolution accepted and complaint marked CLOSED & MET.'
            : 'Resolution disputed. Complaint reopened for field rectification.'
        );
        await loadComplaint();
        onRefresh?.();
      } else {
        setActionError(res.error || 'Failed to verify resolution.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error verifying resolution.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!complaint || !pauseReason.trim()) {
      setActionError('A valid statutory pause reason is required.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiFetch(`/complaints/${complaint.id}/pause`, {
        method: 'POST',
        body: JSON.stringify({ reason: pauseReason }),
      });
      if (res.success) {
        setActionSuccess('SLA timer paused.');
        setPauseReason('');
        await loadComplaint();
        onRefresh?.();
      } else {
        setActionError(res.error || 'Failed to pause SLA.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error pausing SLA.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!complaint) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/complaints/${complaint.id}/resume`, {
        method: 'POST',
      });
      if (res.success) {
        setActionSuccess('SLA timer resumed.');
        await loadComplaint();
        onRefresh?.();
      } else {
        setActionError(res.error || 'Failed to resume SLA.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error resuming SLA.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !reassignName || !reassignPhone) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/complaints/${complaint.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          assignedJeName: reassignName,
          assignedJePhone: reassignPhone,
          notes: reassignReason || 'Reassigned by administrative control desk',
        }),
      });
      if (res.success) {
        setActionSuccess(`Reassigned to ${reassignName}`);
        setReassignName('');
        setReassignPhone('');
        setReassignReason('');
        await loadComplaint();
        onRefresh?.();
      } else {
        setActionError(res.error || 'Failed to reassign.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error reassigning officer.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-border-divider rounded p-12 text-center text-slate-500 text-sm">
        <span className="material-symbols-outlined text-[32px] animate-spin text-primary block mb-2">
          progress_activity
        </span>
        Loading statutory complaint dossier...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="bg-white border border-border-divider rounded p-8 text-center space-y-4">
        <span className="material-symbols-outlined text-[40px] text-red-600">error</span>
        <h2 className="text-base font-bold text-slate-900">Unable to load case record</h2>
        <p className="text-xs text-slate-600">{error || 'Complaint record not found.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded shadow-stitch-sm"
        >
          &larr; Return to Register
        </button>
      </div>
    );
  }

  const currentStage = getStageIndex(complaint.status);
  const sourceAttachments = complaint.attachments || [];
  const resolutionAttachments = complaint.resolutionProof || [];

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Statutory Top Action Bar */}
      <div className="bg-white border border-border-divider rounded p-4 shadow-stitch-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition"
            title="Return to Register"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-base font-bold text-primary tnum">
                {complaint.complaintNumber}
              </h1>
              <button
                onClick={handleCopyId}
                className="text-[10px] text-slate-500 hover:text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
              >
                {copiedId ? 'Copied!' : 'Copy'}
              </button>
              <StatusBadge status={complaint.status} />
              {complaint.isPaused && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                  SLA PAUSED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {complaint.categoryName || complaint.categoryId} • Ward {complaint.wardNumber || '—'} (Zone {complaint.zone || '—'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-surface-low hover:bg-surface-container text-slate-800 border border-border-divider rounded transition"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Dossier</span>
          </button>
          <button
            onClick={loadComplaint}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-surface-low hover:bg-surface-container border border-border-divider rounded transition"
            title="Sync Latest Dossier"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center justify-between">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-slate-400 hover:text-slate-700">
            ×
          </button>
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center justify-between">
          <span>⚠️ {actionError}</span>
          <button onClick={() => setActionError(null)} className="text-slate-400 hover:text-slate-700">
            ×
          </button>
        </div>
      )}

      {/* 2. 5-Stage Visual Statutory Progress Stepper */}
      <div className="bg-white border border-border-divider rounded p-4 shadow-stitch-sm">
        <div className="grid grid-cols-5 gap-1 relative">
          {TIMELINE_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStage || (idx === currentStage && complaint.status === 'CLOSED');
            const isCurrent = idx === currentStage && complaint.status !== 'CLOSED';
            return (
              <div key={stage.key} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-primary text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[10px] mt-1.5 font-semibold tracking-tight ${
                    isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-emerald-800' : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Tab Switcher (< 768px) */}
      <div className="md:hidden flex bg-surface-low p-1 rounded border border-border-divider">
        <button
          onClick={() => setMobileTab('dossier')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded text-center transition ${
            mobileTab === 'dossier' ? 'bg-white text-primary shadow-stitch-sm' : 'text-slate-600'
          }`}
        >
          Dossier &amp; Actions
        </button>
        <button
          onClick={() => setMobileTab('evidence')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded text-center transition ${
            mobileTab === 'evidence' ? 'bg-white text-primary shadow-stitch-sm' : 'text-slate-600'
          }`}
        >
          Evidence ({sourceAttachments.length + resolutionAttachments.length})
        </button>
        <button
          onClick={() => setMobileTab('timeline')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded text-center transition ${
            mobileTab === 'timeline' ? 'bg-white text-primary shadow-stitch-sm' : 'text-slate-600'
          }`}
        >
          Audit Log
        </button>
      </div>

      {/* 3. Main Content Grid (60/40 Split on Desktop, Tabbed on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (Desktop 7 cols / Mobile 'dossier' tab): Details & Action Console */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            mobileTab !== 'dossier' ? 'hidden lg:block' : ''
          }`}
        >
          {/* Statutory Hierarchy Chain */}
          <div className="bg-white border border-border-divider rounded p-4 shadow-stitch-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">account_tree</span>
              Municipal Administrative Chain of Responsibility
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* JE */}
              <div className="p-3 rounded bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Field Officer (JE)</span>
                  <div className="font-bold text-xs text-slate-900 mt-0.5 truncate">
                    {complaint.assignedJeName || 'Unassigned'}
                  </div>
                </div>
                {complaint.assignedJePhone && (
                  <a
                    href={`tel:${complaint.assignedJePhone}`}
                    className="mt-2 text-[11px] font-semibold text-primary flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[13px]">call</span>
                    <span>{complaint.assignedJePhone}</span>
                  </a>
                )}
              </div>

              {/* SDO */}
              <div className="p-3 rounded bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Sub-Divisional Officer (SDO)</span>
                  <div className="font-bold text-xs text-slate-900 mt-0.5 truncate">
                    {complaint.sdoName || 'Zone SDO'}
                  </div>
                </div>
                <span className="mt-2 text-[10px] text-slate-400 font-mono">Branch Supervisor</span>
              </div>

              {/* XEN */}
              <div className="p-3 rounded bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Executive Engineer (XEN)</span>
                  <div className="font-bold text-xs text-slate-900 mt-0.5 truncate">
                    {complaint.xenName || 'Executive Engineer'}
                  </div>
                </div>
                <span className="mt-2 text-[10px] text-slate-400 font-mono">Territorial Apex</span>
              </div>
            </div>
          </div>

          {/* Citizen & Location Metadata */}
          <div className="bg-white border border-border-divider rounded p-4 shadow-stitch-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
              Complainant &amp; Location Coordinates
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Complainant Name</span>
                <span className="font-bold text-slate-900">{complaint.complainantName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Contact Phone</span>
                <span className="font-mono text-slate-900">{complaint.contactNumber}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Grievance Description</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200 mt-0.5 leading-relaxed">
                  {complaint.description}
                </p>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Landmark / Street</span>
                <span className="text-slate-800">{complaint.landmark || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Address</span>
                <span className="text-slate-800">{complaint.address || 'Ludhiana'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Submitted On</span>
                <span className="font-mono text-slate-700 tnum">
                  {new Date(complaint.submittedAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">SLA Deadline</span>
                <span className="font-mono text-slate-700 tnum">
                  {new Date(complaint.dueAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Console: Field JE / Citizen / Supervisor */}
          <div className="bg-white border border-border-divider rounded p-4 shadow-stitch-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 pb-2 border-b border-border-divider">
              <span className="material-symbols-outlined text-[16px] text-primary">tune</span>
              Operational Action Console
            </h2>

            {/* 1. Field JE Resolution Submission */}
            <div className="p-3.5 rounded bg-surface-low border border-border-divider space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span>📸 Field Resolution Report &amp; Evidence</span>
                  <span className="text-[10px] text-red-600 font-semibold">(Mandatory Photo)</span>
                </h3>
                {complaint.status === 'ASSIGNED' && (
                  <button
                    onClick={handleAcknowledge}
                    disabled={actionLoading}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-stitch-sm transition"
                  >
                    Acknowledge Assignment
                  </button>
                )}
                {complaint.status === 'ACKNOWLEDGED' && (
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS', 'Officer commenced work on site')}
                    disabled={actionLoading}
                    className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold shadow-stitch-sm transition"
                  >
                    Mark In Progress
                  </button>
                )}
              </div>

              <form onSubmit={handleResolve} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Completion Notes / Rectification Summary *
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe on-ground work executed (e.g. 5m paver block replaced, leak sealed with clamp)..."
                    className="w-full text-xs bg-white border border-border-divider rounded p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Upload Photographic Proof of Rectification *
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer bg-white border border-dashed border-primary hover:bg-blue-50/50 rounded p-3 text-center transition">
                      <span className="material-symbols-outlined text-primary text-[24px] block mb-1">
                        photo_camera
                      </span>
                      <span className="text-xs font-semibold text-primary block">
                        Tap to Snap Photo or Choose File
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Accepts JPG, PNG up to 10MB • Camera Enabled
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          if (e.target.files) {
                            setProofFiles(Array.from(e.target.files));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {proofFiles.length > 0 && (
                    <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <span>✓ Selected file: {proofFiles[0].name} ({formatBytes(proofFiles[0].size)})</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || proofFiles.length === 0}
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-stitch-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Submit Resolution for Citizen/SDO Verification</span>
                </button>
              </form>
            </div>

            {/* 2. Verification & Closure (Citizen & Supervisor) */}
            {complaint.status === 'RESOLUTION_SUBMITTED' && (
              <div className="p-3.5 rounded bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700 text-[20px]">fact_check</span>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950">Statutory Verification &amp; Closure</h3>
                    <p className="text-[11px] text-emerald-800">
                      Field officer has submitted resolution evidence. Confirm whether work is satisfactory.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-700">Citizen Rating:</span>
                    <div className="flex items-center gap-1">
                      {['1', '2', '3', '4', '5'].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setVerifyRating(star)}
                          className={`text-base ${
                            parseInt(star, 10) <= parseInt(verifyRating, 10)
                              ? 'text-amber-500'
                              : 'text-slate-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={verifyFeedback}
                    onChange={(e) => setVerifyFeedback(e.target.value)}
                    placeholder="Optional remarks or quality comments..."
                    className="w-full text-xs bg-white border border-emerald-300 rounded p-2 text-slate-900"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleVerifyClosure('accepted')}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-stitch-sm transition flex items-center justify-center gap-1"
                    >
                      <span>✓ Accept &amp; Mark Closed</span>
                    </button>
                    <button
                      onClick={() => handleVerifyClosure('disputed')}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-stitch-sm transition flex items-center justify-center gap-1"
                    >
                      <span>✕ Dispute &amp; Reopen</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Supervisor SLA Pause / Resume & Reassignment */}
            <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-800 block">Supervisor SLA &amp; Dispatch Controls</span>

              {/* Pause / Resume */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {complaint.isPaused ? (
                  <button
                    onClick={handleResume}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-4 py-1.5 bg-emerald-700 text-white rounded font-semibold text-xs transition"
                  >
                    Resume SLA Clock
                  </button>
                ) : (
                  <div className="flex w-full items-center gap-2">
                    <input
                      type="text"
                      value={pauseReason}
                      onChange={(e) => setPauseReason(e.target.value)}
                      placeholder="Statutory pause reason (e.g. Heavy rainfall, NGT stay)..."
                      className="flex-1 bg-white border border-border-divider rounded px-2.5 py-1.5 text-xs text-slate-900"
                    />
                    <button
                      onClick={handlePause}
                      disabled={actionLoading || !pauseReason.trim()}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs transition shrink-0 disabled:opacity-50"
                    >
                      Pause SLA
                    </button>
                  </div>
                )}
              </div>

              {/* Reassignment Form */}
              <form onSubmit={handleReassign} className="pt-2 border-t border-slate-200 space-y-2">
                <span className="font-semibold text-slate-700 block text-[11px]">Reassign Field Officer:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={reassignName}
                    onChange={(e) => setReassignName(e.target.value)}
                    placeholder="New Officer Name"
                    className="bg-white border border-border-divider rounded px-2 py-1 text-xs"
                    required
                  />
                  <input
                    type="tel"
                    value={reassignPhone}
                    onChange={(e) => setReassignPhone(e.target.value)}
                    placeholder="10-digit Phone"
                    className="bg-white border border-border-divider rounded px-2 py-1 text-xs"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    placeholder="Reassignment reason..."
                    className="flex-1 bg-white border border-border-divider rounded px-2 py-1 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading || !reassignName}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs disabled:opacity-50"
                  >
                    Reassign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column (Desktop 5 cols / Mobile 'evidence' tab): Side-by-side Evidence Photos & Audit Trail */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            mobileTab === 'dossier' ? 'hidden lg:block' : ''
          }`}
        >
          {/* Photographic Evidence Card */}
          <div className="bg-white border border-border-divider rounded p-4 shadow-stitch-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between pb-2 border-b border-border-divider">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">photo_library</span>
                Photographic Verification Bench
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {sourceAttachments.length + resolutionAttachments.length} Files
              </span>
            </h2>

            {/* Before Photo (Intake) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase">
                  1. Citizen Intake Evidence (Before)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {sourceAttachments.length} attached
                </span>
              </div>

              {sourceAttachments.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded text-center text-xs text-slate-400">
                  No intake photograph uploaded.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {sourceAttachments.map((att, idx) => (
                    <div
                      key={att.fileId || idx}
                      onClick={() =>
                        setLightboxImage({
                          url: att.fileUrl,
                          title: `Citizen Intake Evidence - ${complaint.complaintNumber}`,
                          fileName: att.fileName,
                        })
                      }
                      className="group relative rounded border border-border-divider overflow-hidden bg-slate-100 cursor-pointer shadow-stitch-sm"
                    >
                      <img
                        src={att.fileUrl}
                        alt="Intake Evidence"
                        className="w-full h-44 object-cover group-hover:scale-102 transition duration-200"
                        onError={(e) => {
                          // Fallback placeholder on media fetch error
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-[10px] flex items-center justify-between">
                        <span className="truncate max-w-[200px] font-mono">{att.fileName}</span>
                        <span>{formatBytes(att.size)}</span>
                      </div>
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition">
                        <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* After Photo (Resolution) */}
            <div className="pt-2 border-t border-border-divider">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                  <span>2. Field Resolution Evidence (After)</span>
                  {resolutionAttachments.length > 0 && <span>✓</span>}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {resolutionAttachments.length} attached
                </span>
              </div>

              {resolutionAttachments.length === 0 ? (
                <div className="p-4 bg-amber-50/50 border border-dashed border-amber-200 rounded text-center text-xs text-amber-800">
                  Awaiting on-site resolution photograph from field officer.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {resolutionAttachments.map((att, idx) => (
                    <div
                      key={att.fileId || idx}
                      onClick={() =>
                        setLightboxImage({
                          url: att.fileUrl,
                          title: `Field Rectification Proof - ${complaint.complaintNumber}`,
                          fileName: att.fileName,
                        })
                      }
                      className="group relative rounded border-2 border-emerald-400 overflow-hidden bg-slate-100 cursor-pointer shadow-stitch-sm"
                    >
                      <img
                        src={att.fileUrl}
                        alt="Resolution Proof"
                        className="w-full h-44 object-cover group-hover:scale-102 transition duration-200"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        VERIFIED RECTIFICATION
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-[10px] flex items-center justify-between">
                        <span className="truncate max-w-[200px] font-mono">{att.fileName}</span>
                        <span>{formatBytes(att.size)}</span>
                      </div>
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition">
                        <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div
            className={`bg-white border border-border-divider rounded p-4 shadow-stitch-sm space-y-3 ${
              mobileTab === 'timeline' ? 'block' : mobileTab === 'evidence' ? 'hidden lg:block' : ''
            }`}
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 pb-2 border-b border-border-divider">
              <span className="material-symbols-outlined text-[16px] text-primary">history</span>
              Chronological Audit Log
            </h2>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {(!complaint.timeline || complaint.timeline.length === 0) ? (
                <div className="text-xs text-slate-400 text-center py-4">No audit events recorded.</div>
              ) : (
                complaint.timeline.map((evt, idx) => (
                  <div key={evt.id || idx} className="flex gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 pb-2 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{evt.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono tnum">
                          {new Date(evt.timestamp).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        By <strong className="text-slate-800">{evt.actorName}</strong> ({evt.actorRole})
                      </div>
                      {evt.notes && (
                        <div className="text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded mt-1 border border-slate-100">
                          {evt.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default ComplaintDetailPage;
