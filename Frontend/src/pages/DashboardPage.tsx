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
      const res = await apiFetch('/complaints?limit=300');
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

  const complianceRate = total > 0 ? Math.round(((total - breached) / total) * 100) : 100;

  // Department counts
  const branchCounts: Record<DepartmentBranch, { open: number; breached: number }> = {
    'O&M': {
      open: complaints.filter((c) => c.branch === 'O&M' && c.status !== 'CLOSED').length,
      breached: complaints.filter((c) => c.branch === 'O&M' && c.slaBreached && c.status !== 'CLOSED').length,
    },
    'B&R': {
      open: complaints.filter((c) => c.branch === 'B&R' && c.status !== 'CLOSED').length,
      breached: complaints.filter((c) => c.branch === 'B&R' && c.slaBreached && c.status !== 'CLOSED').length,
    },
    'Health': {
      open: complaints.filter((c) => c.branch === 'Health' && c.status !== 'CLOSED').length,
      breached: complaints.filter((c) => c.branch === 'Health' && c.slaBreached && c.status !== 'CLOSED').length,
    },
    'Light': {
      open: complaints.filter((c) => c.branch === 'Light' && c.status !== 'CLOSED').length,
      breached: complaints.filter((c) => c.branch === 'Light' && c.slaBreached && c.status !== 'CLOSED').length,
    },
  };

  // Urgent attention list (Breached or nearing deadline)
  const urgentQueue = complaints
    .filter((c) => c.status !== 'CLOSED')
    .sort((a, b) => {
      if (a.slaBreached && !b.slaBreached) return -1;
      if (!a.slaBreached && b.slaBreached) return 1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    })
    .slice(0, 8);

  const formatHoursRemaining = (dueAt: string, isBreached: boolean) => {
    if (isBreached) return 'OVERDUE';
    const diff = new Date(dueAt).getTime() - nowMs;
    if (diff <= 0) return 'OVERDUE';
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Command Banner */}
      <div className="bg-white border border-border-divider rounded p-4 sm:p-5 shadow-stitch-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
              ICCC COMMAND DESK
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Operational Scope: {user?.role ? user.role.toUpperCase() : 'ALL BRANCHES'} {user?.branch ? `(${user.branch})` : ''} {user?.zone ? `• Zone ${user.zone}` : ''}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Municipal Operational Command Center
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time grievance telemetry, 48-working-hour statutory SLA watch, and inter-departmental field dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => loadDashboardData()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-surface-low hover:bg-surface-container text-slate-700 border border-border-divider rounded transition"
            title="Refresh Live Metrics"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Sync</span>
          </button>
          <button
            onClick={() => onNavigateToRegistry()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded shadow-stitch-sm transition"
          >
            <span className="material-symbols-outlined text-[16px]">list_alt</span>
            <span>View All Records</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-red-600 text-[18px]">error</span>
            {error}
          </span>
          <button onClick={loadDashboardData} className="font-semibold underline ml-2">
            Retry
          </button>
        </div>
      )}

      {/* 2. 6-Tile High-Density Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Active */}
        <div
          onClick={() => onNavigateToRegistry()}
          className="bg-white border border-border-divider rounded p-3.5 shadow-stitch-sm hover:border-primary transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Active</span>
            <span className="material-symbols-outlined text-[18px] text-blue-600">inventory_2</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tnum">{loading ? '—' : total}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across 95 Ludhiana Wards</div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => onNavigateToRegistry(undefined, 'IN_PROGRESS')}
          className="bg-white border border-border-divider rounded p-3.5 shadow-stitch-sm hover:border-primary transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <span className="material-symbols-outlined text-[18px] text-indigo-600">engineering</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tnum">{loading ? '—' : inProgress}</div>
          <div className="text-[10px] text-indigo-700 font-medium mt-1">Assigned & Dispatched</div>
        </div>

        {/* SLA Breached */}
        <div
          onClick={() => onNavigateToRegistry(undefined, 'BREACHED')}
          className="bg-red-50/60 border border-red-200 rounded p-3.5 shadow-stitch-sm hover:border-red-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-red-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">SLA Breaches</span>
            <span className="material-symbols-outlined text-[18px] text-red-600">warning</span>
          </div>
          <div className="text-2xl font-bold text-red-700 tnum">{loading ? '—' : breached}</div>
          <div className="text-[10px] text-red-600 font-semibold mt-1">&gt; 48 Working Hours</div>
        </div>

        {/* At Risk */}
        <div
          onClick={() => onNavigateToRegistry()}
          className="bg-amber-50/60 border border-amber-200 rounded p-3.5 shadow-stitch-sm hover:border-amber-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">At Risk</span>
            <span className="material-symbols-outlined text-[18px] text-amber-600">timer</span>
          </div>
          <div className="text-2xl font-bold text-amber-900 tnum">{loading ? '—' : atRisk}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1">&lt; 12 Working Hours</div>
        </div>

        {/* Pending Verification */}
        <div
          onClick={() => onNavigateToRegistry(undefined, 'RESOLUTION_SUBMITTED')}
          className="bg-blue-50/60 border border-blue-200 rounded p-3.5 shadow-stitch-sm hover:border-blue-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-blue-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Needs Review</span>
            <span className="material-symbols-outlined text-[18px] text-blue-700">fact_check</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 tnum">{loading ? '—' : resolutionSubmitted}</div>
          <div className="text-[10px] text-blue-700 font-semibold mt-1">Proof Submitted</div>
        </div>

        {/* Compliance Rate */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded p-3.5 shadow-stitch-sm">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Compliance</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900 tnum">{loading ? '—' : `${complianceRate}%`}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">Target: &ge; 90%</div>
        </div>
      </div>

      {/* 3. Departmental Dispatch Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">account_balance</span>
            Municipal Departmental Allocation
          </h2>
          <span className="text-xs text-slate-500 font-medium">Click department to filter register</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* O&M */}
          <div
            onClick={() => onNavigateToRegistry('O&M')}
            className="bg-white border border-border-divider hover:border-primary rounded p-4 shadow-stitch-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  💧
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Operations &amp; Maintenance</h3>
                  <span className="text-[10px] text-slate-500 font-medium">Water, Sewerage, Tubewells</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-divider mt-2">
              <span className="text-xs text-slate-600">Active Load:</span>
              <span className="font-bold text-sm text-slate-900 tnum">{branchCounts['O&M'].open}</span>
            </div>
            {branchCounts['O&M'].breached > 0 && (
              <div className="text-[10px] text-red-600 font-bold mt-1">
                ⚠️ {branchCounts['O&M'].breached} Breached SLAs
              </div>
            )}
          </div>

          {/* B&R */}
          <div
            onClick={() => onNavigateToRegistry('B&R')}
            className="bg-white border border-border-divider hover:border-primary rounded p-4 shadow-stitch-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                  🏗️
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Building &amp; Roads</h3>
                  <span className="text-[10px] text-slate-500 font-medium">Potholes, Paver Blocks, Drains</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-divider mt-2">
              <span className="text-xs text-slate-600">Active Load:</span>
              <span className="font-bold text-sm text-slate-900 tnum">{branchCounts['B&R'].open}</span>
            </div>
            {branchCounts['B&R'].breached > 0 && (
              <div className="text-[10px] text-red-600 font-bold mt-1">
                ⚠️ {branchCounts['B&R'].breached} Breached SLAs
              </div>
            )}
          </div>

          {/* Health */}
          <div
            onClick={() => onNavigateToRegistry('Health')}
            className="bg-white border border-border-divider hover:border-primary rounded p-4 shadow-stitch-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  🌿
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Health &amp; Sanitation</h3>
                  <span className="text-[10px] text-slate-500 font-medium">Garbage Dumps, Fogging</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-divider mt-2">
              <span className="text-xs text-slate-600">Active Load:</span>
              <span className="font-bold text-sm text-slate-900 tnum">{branchCounts['Health'].open}</span>
            </div>
            {branchCounts['Health'].breached > 0 && (
              <div className="text-[10px] text-red-600 font-bold mt-1">
                ⚠️ {branchCounts['Health'].breached} Breached SLAs
              </div>
            )}
          </div>

          {/* Light */}
          <div
            onClick={() => onNavigateToRegistry('Light')}
            className="bg-white border border-border-divider hover:border-primary rounded p-4 shadow-stitch-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold text-sm">
                  💡
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Street Lighting</h3>
                  <span className="text-[10px] text-slate-500 font-medium">LED Lights, Feeder Panels</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-divider mt-2">
              <span className="text-xs text-slate-600">Active Load:</span>
              <span className="font-bold text-sm text-slate-900 tnum">{branchCounts['Light'].open}</span>
            </div>
            {branchCounts['Light'].breached > 0 && (
              <div className="text-[10px] text-red-600 font-bold mt-1">
                ⚠️ {branchCounts['Light'].breached} Breached SLAs
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Urgent Intervention Queue (Table on Desktop, Cards on Mobile) */}
      <div className="bg-white border border-border-divider rounded shadow-stitch-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border-divider bg-[#f8fafc] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-[20px]">emergency</span>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Urgent SLA Attention Queue
            </h2>
            <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {urgentQueue.length}
            </span>
          </div>
          <button
            onClick={() => onNavigateToRegistry(undefined, 'BREACHED')}
            className="text-xs font-semibold text-primary hover:text-primary-hover transition flex items-center gap-1"
          >
            <span>Full Queue</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Desktop View Table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-low border-b border-border-divider text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Complaint ID</th>
                <th className="py-2.5 px-4">Category &amp; Branch</th>
                <th className="py-2.5 px-4">Location &amp; Ward</th>
                <th className="py-2.5 px-4">Assigned Officer (JE)</th>
                <th className="py-2.5 px-4">SLA Time Remaining</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-divider">
              {urgentQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No critical SLA breaches or overdue complaints detected.
                  </td>
                </tr>
              ) : (
                urgentQueue.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectComplaint(item.id)}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-primary tnum">
                      {item.complaintNumber}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{item.categoryName || item.categoryId}</div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">{item.branch}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="truncate max-w-[200px] text-slate-800">{item.landmark || item.address || 'Ludhiana'}</div>
                      <span className="text-[10px] text-slate-500 font-medium">Ward {item.wardNumber || '—'} {item.zone ? `• Zone ${item.zone}` : ''}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-medium text-slate-900">{item.assignedJeName || 'Unassigned'}</div>
                      {item.assignedJePhone && (
                        <span className="text-[10px] text-slate-500 font-mono">{item.assignedJePhone}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono tnum ${
                          item.slaBreached
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {formatHoursRemaining(item.dueAt, item.slaBreached)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(item.id);
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

        {/* Mobile View Cards (shown only on mobile) */}
        <div className="md:hidden divide-y divide-border-divider">
          {urgentQueue.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No critical SLA breaches or overdue complaints detected.
            </div>
          ) : (
            urgentQueue.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectComplaint(item.id)}
                className="p-3.5 hover:bg-slate-50 transition active:bg-slate-100 flex flex-col gap-2 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-primary tnum">
                    {item.complaintNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tnum ${
                        item.slaBreached
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {formatHoursRemaining(item.dueAt, item.slaBreached)}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {item.categoryName || item.categoryId}
                </div>

                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                  <span className="truncate max-w-[220px]">
                    📍 {item.landmark || item.address || 'Ludhiana'} (Ward {item.wardNumber || '—'})
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 uppercase">{item.branch}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-600 font-medium">
                    Officer: <strong className="text-slate-900">{item.assignedJeName || 'Pending'}</strong>
                  </span>
                  {item.assignedJePhone ? (
                    <a
                      href={`tel:${item.assignedJePhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-primary font-semibold text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                    >
                      <span className="material-symbols-outlined text-[13px]">call</span>
                      <span>Call JE</span>
                    </a>
                  ) : (
                    <span className="text-primary font-semibold text-xs">View &rarr;</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
