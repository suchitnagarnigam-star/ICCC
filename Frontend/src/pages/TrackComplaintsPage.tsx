import React, { useState, useEffect } from 'react';
import { Complaint } from '../types';
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
}) => {
  const { isAuthenticated } = useAuth();
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
      let query = '/complaints?limit=300';
      const params = new URLSearchParams();
      if (selectedBranch) params.append('branch', selectedBranch);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedZone) params.append('zone', selectedZone);
      if (params.toString()) query += `&${params.toString()}`;

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

      if (res.success && res.complaint) {
        setPublicResult(res.complaint);
      } else {
        setPublicError(res.error || 'No matching complaint found.');
      }
    } catch (err: any) {
      setPublicError(err.message || 'Verification failed. Please verify your complaint details.');
    } finally {
      setPublicLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredComplaints.length === 0) return;
    const headers = [
      'Complaint Number',
      'Complainant',
      'Contact',
      'Category',
      'Branch',
      'Ward',
      'Zone',
      'Address',
      'Status',
      'Assigned JE',
      'SLA Due Date',
      'Breached',
    ];
    const rows = filteredComplaints.map((c) => [
      c.complaintNumber,
      `"${c.complainantName.replace(/"/g, '""')}"`,
      c.contactNumber,
      `"${(c.categoryName || c.categoryId).replace(/"/g, '""')}"`,
      c.branch,
      c.wardNumber || '',
      c.zone || '',
      `"${(c.landmark || c.address || '').replace(/"/g, '""')}"`,
      c.status,
      `"${(c.assignedJeName || '').replace(/"/g, '""')}"`,
      c.dueAt,
      c.slaBreached ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MCL_ICCC_Grievances_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter complaints client-side
  const filteredComplaints = complaints.filter((c) => {
    if (selectedStatus === 'BREACHED') {
      if (!c.slaBreached || c.status === 'CLOSED') return false;
    } else if (selectedStatus && c.status !== selectedStatus) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = c.complaintNumber.toLowerCase().includes(q);
      const matchName = c.complainantName.toLowerCase().includes(q);
      const matchPhone = c.contactNumber.includes(q);
      const matchLandmark = (c.landmark || '').toLowerCase().includes(q);
      const matchCat = (c.categoryName || c.categoryId).toLowerCase().includes(q);
      const matchOfficer = (c.assignedJeName || '').toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchPhone && !matchLandmark && !matchCat && !matchOfficer) {
        return false;
      }
    }
    return true;
  });

  const nowMs = Date.now();
  const formatSlaCountdown = (dueAt: string, isBreached: boolean) => {
    if (isBreached) return 'OVERDUE';
    const diff = new Date(dueAt).getTime() - nowMs;
    if (diff <= 0) return 'OVERDUE';
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  // If viewing a single complaint dossier
  if (activeComplaintId) {
    return (
      <ComplaintDetailPage
        complaintId={activeComplaintId}
        onBack={() => {
          setActiveComplaintId(null);
          onClearInitialId?.();
        }}
        onRefresh={loadRegistryComplaints}
      />
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header & Mode Switcher */}
      <div className="bg-white border border-border-divider rounded p-4 shadow-stitch-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">
              CENTRAL REGISTER
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Statutory 48-Hour Resolution Protocol
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Comprehensive Grievance Administrative Register
          </h1>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex items-center bg-surface-low p-1 rounded border border-border-divider self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3 py-1 text-xs font-semibold rounded transition ${
              activeTab === 'registry'
                ? 'bg-white text-primary shadow-stitch-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Operational Registry {complaints.length > 0 && `(${filteredComplaints.length})`}
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`px-3 py-1 text-xs font-semibold rounded transition ${
              activeTab === 'public'
                ? 'bg-white text-primary shadow-stitch-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Public Quick Track
          </button>
        </div>
      </div>

      {/* Mode 1: Public Quick Tracker */}
      {activeTab === 'public' && (
        <div className="max-w-2xl mx-auto space-y-4 pt-2">
          <div className="bg-white border border-border-divider rounded p-5 sm:p-6 shadow-stitch-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded bg-primary-container text-white flex items-center justify-center font-bold text-sm">
                🔍
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Citizen Single-Window Verification</h2>
                <p className="text-xs text-slate-600">
                  Track resolution progress and inspect filed evidence by entering your complaint number and registered mobile number.
                </p>
              </div>
            </div>

            <form onSubmit={handlePublicTrack} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complaint Number / Token *
                </label>
                <input
                  type="text"
                  value={publicComplaintNumber}
                  onChange={(e) => setPublicComplaintNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. MCL-2026-0001"
                  className="w-full text-xs font-mono font-bold bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered 10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={publicContactNumber}
                  onChange={(e) => setPublicContactNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9814012345"
                  className="w-full text-xs font-mono bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              {publicError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{publicError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  disabled={publicLoading}
                  className="w-full sm:w-auto px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded shadow-stitch-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  <span>{publicLoading ? 'Verifying...' : 'Track Grievance Status'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Public Result Display */}
          {publicResult && (
            <div className="bg-white border border-border-divider rounded p-5 shadow-stitch-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-divider pb-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Verified Citizen Ticket</span>
                  <h3 className="font-mono text-base font-bold text-primary tnum">
                    {publicResult.complaintNumber}
                  </h3>
                </div>
                <StatusBadge status={publicResult.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Department Branch</span>
                  <span className="font-bold text-slate-800">{publicResult.branch}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Territory</span>
                  <span className="font-semibold text-slate-800">Ward {publicResult.wardNumber || '—'} (Zone {publicResult.zone || '—'})</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px] uppercase">Category</span>
                  <span className="font-medium text-slate-800">{publicResult.categoryName || publicResult.categoryId}</span>
                </div>
                <div className="col-span-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase">Landmark &amp; Address</span>
                  <span className="font-medium text-slate-800">{publicResult.landmark || publicResult.address || 'Ludhiana'}</span>
                </div>
                {publicResult.assignedOfficer && (
                  <div className="col-span-2 bg-blue-50/60 p-2.5 rounded border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-blue-700 block text-[10px] uppercase font-semibold">Assigned Field Officer (JE)</span>
                      <span className="font-bold text-slate-900">{publicResult.assignedOfficer.name}</span>
                    </div>
                    {publicResult.assignedOfficer.phone && (
                      <a
                        href={`tel:${publicResult.assignedOfficer.phone}`}
                        className="px-2 py-1 bg-white border border-blue-300 text-blue-700 rounded text-xs font-semibold flex items-center gap-1 shadow-stitch-sm"
                      >
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        <span>Call Officer</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border-divider flex justify-end">
                <button
                  onClick={() => setActiveComplaintId(publicResult.id)}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded shadow-stitch-sm transition flex items-center gap-1.5"
                >
                  <span>Open Full Citizen Dossier</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Full Operational Registry */}
      {activeTab === 'registry' && (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="bg-white border border-border-divider rounded p-3 shadow-stitch-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Complaint ID, Complainant, Phone, Officer, Landmark..."
                className="w-full text-xs bg-surface-low border border-border-divider rounded pl-8 pr-3 py-1.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Branch */}
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="text-xs bg-surface-low border border-border-divider rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Branches</option>
                <option value="O&M">O&amp;M (Water/Sewer)</option>
                <option value="B&R">B&amp;R (Roads/Bridges)</option>
                <option value="Health">Health (Sanitation)</option>
                <option value="Light">Street Lighting</option>
              </select>

              {/* Status */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs bg-surface-low border border-border-divider rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLUTION_SUBMITTED">Needs Review</option>
                <option value="CLOSED">Closed &amp; Met</option>
                <option value="BREACHED">⚠️ SLA Breached</option>
              </select>

              {/* Zone */}
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="text-xs bg-surface-low border border-border-divider rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Zones</option>
                <option value="A">Zone A</option>
                <option value="B">Zone B</option>
                <option value="C">Zone C</option>
                <option value="D">Zone D</option>
              </select>

              {/* Action Buttons */}
              <button
                onClick={loadRegistryComplaints}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-surface-low hover:bg-surface-container border border-border-divider rounded transition"
                title="Refresh Registry"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-surface-low hover:bg-surface-container text-slate-800 border border-border-divider rounded transition"
                title="Export Filtered CSV"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {registryError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center justify-between">
              <span>{registryError}</span>
              <button onClick={loadRegistryComplaints} className="font-semibold underline ml-2">
                Retry
              </button>
            </div>
          )}

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block bg-white border border-border-divider rounded shadow-stitch-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-low border-b border-border-divider text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Complaint ID</th>
                    <th className="py-2.5 px-3.5">Category &amp; Branch</th>
                    <th className="py-2.5 px-3.5">Complainant</th>
                    <th className="py-2.5 px-3.5">Location &amp; Ward</th>
                    <th className="py-2.5 px-3.5">Assigned Officer (JE)</th>
                    <th className="py-2.5 px-3.5">SLA Countdown</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-divider">
                  {registryLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Loading municipal grievances register...
                      </td>
                    </tr>
                  ) : filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No grievance records match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setActiveComplaintId(item.id)}
                        className="hover:bg-slate-50/80 transition cursor-pointer"
                      >
                        <td className="py-2.5 px-3.5 font-mono font-bold text-primary tnum">
                          {item.complaintNumber}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                            {item.categoryName || item.categoryId}
                          </div>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">{item.branch}</span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="font-medium text-slate-800">{item.complainantName}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{item.contactNumber}</span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="truncate max-w-[180px] text-slate-800">
                            {item.landmark || item.address || 'Ludhiana'}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Ward {item.wardNumber || '—'} {item.zone ? `• Zone ${item.zone}` : ''}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="font-medium text-slate-900">{item.assignedJeName || 'Unassigned'}</div>
                          {item.assignedJePhone && (
                            <span className="text-[10px] text-slate-500 font-mono">{item.assignedJePhone}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono tnum ${
                              item.status === 'CLOSED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : item.slaBreached
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {item.status === 'CLOSED'
                              ? 'MET'
                              : formatSlaCountdown(item.dueAt, item.slaBreached)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveComplaintId(item.id);
                            }}
                            className="px-2.5 py-1 bg-surface-low hover:bg-surface-container text-primary font-semibold text-xs rounded border border-border-divider transition"
                          >
                            Dossier &rarr;
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Desktop Table Footer */}
            <div className="p-3 bg-surface-low border-t border-border-divider flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">
                Showing <strong className="text-slate-900">{filteredComplaints.length}</strong> of{' '}
                <strong className="text-slate-900">{complaints.length}</strong> registered complaints
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Click any row to open the complete inspection dossier
              </span>
            </div>
          </div>

          {/* Mobile High-Density Cards (< 768px) */}
          <div className="md:hidden space-y-2.5">
            {registryLoading ? (
              <div className="bg-white border border-border-divider rounded p-6 text-center text-slate-500 text-xs">
                Loading complaints...
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="bg-white border border-border-divider rounded p-6 text-center text-slate-500 text-xs">
                No complaints found matching criteria.
              </div>
            ) : (
              filteredComplaints.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveComplaintId(item.id)}
                  className="bg-white border border-border-divider rounded p-3.5 shadow-stitch-sm active:bg-slate-50 transition flex flex-col gap-2 cursor-pointer"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-primary tnum">
                      {item.complaintNumber}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tnum ${
                          item.status === 'CLOSED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.slaBreached
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status === 'CLOSED' ? 'MET' : formatSlaCountdown(item.dueAt, item.slaBreached)}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  {/* Category Title */}
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {item.categoryName || item.categoryId}
                  </div>

                  {/* Location & Complainant */}
                  <div className="text-[11px] text-slate-600 flex flex-col gap-0.5">
                    <div className="truncate">
                      📍 {item.landmark || item.address || 'Ludhiana'} (Ward {item.wardNumber || '—'})
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Citizen: {item.complainantName} • {item.branch}
                    </div>
                  </div>

                  {/* Officer Footer & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-700 font-medium truncate max-w-[180px]">
                      JE: <strong className="text-slate-900">{item.assignedJeName || 'Pending'}</strong>
                    </span>

                    {item.assignedJePhone ? (
                      <a
                        href={`tel:${item.assignedJePhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-primary font-semibold text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                      >
                        <span className="material-symbols-outlined text-[13px]">call</span>
                        <span>Call</span>
                      </a>
                    ) : (
                      <span className="text-primary font-semibold text-xs">Inspect &rarr;</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackComplaintsPage;
