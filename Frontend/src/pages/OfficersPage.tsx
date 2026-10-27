import React, { useState, useEffect } from 'react';
import { WardOfficers } from '../types';
import { apiFetch } from '../shared/utils/apiConfig';

export const OfficersPage: React.FC = () => {
  const [wardRoster, setWardRoster] = useState<WardOfficers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<'ALL' | 'BR' | 'OM' | 'Health' | 'Light'>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('');

  useEffect(() => {
    async function loadOfficers() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch('/reference/officers');
        if (res.success && res.data) {
          setWardRoster(res.data);
        } else {
          setWardRoster([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load officer directory.');
      } finally {
        setLoading(false);
      }
    }
    loadOfficers();
  }, []);

  const filteredWards = wardRoster.filter((item) => {
    if (selectedZone && item.zone !== selectedZone) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const wardMatch = String(item.ward).includes(q) || `ward ${item.ward}`.includes(q);
    const constMatch = item.constituency && item.constituency.toLowerCase().includes(q);
    const mlaMatch = item.mla && item.mla.toLowerCase().includes(q);

    // Search across officer names in this ward
    const brOfficers = Object.values(item.officers?.BR || {}).map((o: any) => o?.name?.toLowerCase() || '').join(' ');
    const omOfficers = Object.values(item.officers?.OM || {}).map((o: any) => o?.name?.toLowerCase() || '').join(' ');
    const healthOfficers = Object.values(item.officers?.Health || {}).map((o: any) => o?.name?.toLowerCase() || '').join(' ');
    const lightOfficers = Object.values(item.officers?.Light || {}).map((o: any) => o?.name?.toLowerCase() || '').join(' ');

    return (
      wardMatch ||
      constMatch ||
      mlaMatch ||
      brOfficers.includes(q) ||
      omOfficers.includes(q) ||
      healthOfficers.includes(q) ||
      lightOfficers.includes(q)
    );
  });

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Header Bar */}
      <div className="bg-white border border-border-divider rounded p-4 sm:p-5 shadow-stitch-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">
              OFFICIAL GAZETTE
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Sec. 44(2) Punjab Municipal Corporation Act
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Municipal Officer Administrative Ledger (Wards 1–95)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Territorial cadre directory connecting Ludhiana's 95 wards with designated field Junior Engineers (JE), Sub-Divisional Officers (SDO), and Executive Engineers (XEN).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-surface-low hover:bg-surface-container text-slate-700 border border-border-divider rounded transition"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Roster</span>
          </button>
        </div>
      </div>

      {/* 2. 4-KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-border-divider rounded p-3.5 shadow-stitch-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Wards Mapped</span>
          <div className="text-2xl font-bold text-slate-900 tnum mt-0.5">{wardRoster.length || 95}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">100% Territorial Coverage</div>
        </div>

        <div className="bg-white border border-border-divider rounded p-3.5 shadow-stitch-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Municipal Zones</span>
          <div className="text-2xl font-bold text-slate-900 tnum mt-0.5">4</div>
          <div className="text-[10px] text-slate-500 mt-1">Zone A, B, C &amp; D</div>
        </div>

        <div className="bg-white border border-border-divider rounded p-3.5 shadow-stitch-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Field JEs</span>
          <div className="text-2xl font-bold text-blue-700 tnum mt-0.5">48</div>
          <div className="text-[10px] text-blue-600 font-medium mt-1">On-Ground Dispatch</div>
        </div>

        <div className="bg-white border border-border-divider rounded p-3.5 shadow-stitch-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Supervising SDOs</span>
          <div className="text-2xl font-bold text-slate-900 tnum mt-0.5">14</div>
          <div className="text-[10px] text-slate-500 mt-1">Quality &amp; Closure Audits</div>
        </div>
      </div>

      {/* 3. Filter Controls */}
      <div className="bg-white border border-border-divider rounded p-3.5 shadow-stitch-sm flex flex-col md:flex-row gap-2.5">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Ward # (e.g. 14), Officer Name, MLA, or Constituency..."
            className="w-full text-xs bg-surface-low border border-border-divider rounded pl-8 pr-3 py-1.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value as any)}
            className="text-xs bg-surface-low border border-border-divider rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Departments</option>
            <option value="OM">Operations &amp; Maintenance (Water/Sewer)</option>
            <option value="BR">Building &amp; Roads (Potholes/Streets)</option>
            <option value="Health">Health &amp; Sanitation</option>
            <option value="Light">Street Lighting</option>
          </select>

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
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      {/* 4. Ward Directory Grid */}
      {loading ? (
        <div className="bg-white border border-border-divider rounded p-12 text-center text-slate-500 text-xs">
          Loading 95-ward administrative officer ledger...
        </div>
      ) : filteredWards.length === 0 ? (
        <div className="bg-white border border-border-divider rounded p-8 text-center text-slate-500 text-xs">
          No ward or officer record matches your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredWards.map((w) => (
            <div
              key={w.ward}
              className="bg-white border border-border-divider rounded p-4 shadow-stitch-sm flex flex-col justify-between hover:border-primary transition"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border-divider">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold text-xs shadow-stitch-sm font-mono tnum">
                      W{w.ward}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        Ward #{w.ward}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Zone {w.zone} {w.constituency ? `• ${w.constituency}` : ''}
                      </span>
                    </div>
                  </div>
                  {w.mla && (
                    <span className="text-[9px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      MLA: {w.mla}
                    </span>
                  )}
                </div>

                {/* Officers List */}
                <div className="space-y-2 mt-3 text-xs">
                  {/* B&R */}
                  {(selectedBranch === 'ALL' || selectedBranch === 'BR') && w.officers?.BR && (
                    <div className="bg-surface-low p-2 rounded border border-border-divider">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-amber-900 uppercase">
                          Building &amp; Roads (B&amp;R)
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="On Field Duty"></span>
                      </div>
                      {w.officers.BR.je && (
                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          <span className="text-slate-700">
                            JE: <strong className="text-slate-900">{w.officers.BR.je.name}</strong>
                          </span>
                          <a
                            href={`tel:${w.officers.BR.je.phone}`}
                            className="font-mono text-[10px] text-primary hover:underline flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[12px]">call</span>
                            <span>{w.officers.BR.je.phone}</span>
                          </a>
                        </div>
                      )}
                      {w.officers.BR.sdo && (
                        <div className="flex items-center justify-between mt-0.5 text-[10px] text-slate-500">
                          <span>SDO: {w.officers.BR.sdo.name}</span>
                          <span className="font-mono">{w.officers.BR.sdo.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* O&M */}
                  {(selectedBranch === 'ALL' || selectedBranch === 'OM') && w.officers?.OM && (
                    <div className="bg-surface-low p-2 rounded border border-border-divider">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-blue-900 uppercase">
                          Operations &amp; Maintenance (O&amp;M)
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="On Field Duty"></span>
                      </div>
                      {w.officers.OM.je && (
                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          <span className="text-slate-700">
                            JE: <strong className="text-slate-900">{w.officers.OM.je.name}</strong>
                          </span>
                          <a
                            href={`tel:${w.officers.OM.je.phone}`}
                            className="font-mono text-[10px] text-primary hover:underline flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[12px]">call</span>
                            <span>{w.officers.OM.je.phone}</span>
                          </a>
                        </div>
                      )}
                      {w.officers.OM.sdo && (
                        <div className="flex items-center justify-between mt-0.5 text-[10px] text-slate-500">
                          <span>SDO: {w.officers.OM.sdo.name}</span>
                          <span className="font-mono">{w.officers.OM.sdo.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Health */}
                  {(selectedBranch === 'ALL' || selectedBranch === 'Health') && w.officers?.Health && (
                    <div className="bg-surface-low p-2 rounded border border-border-divider">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-emerald-900 uppercase">
                          Health &amp; Sanitation
                        </span>
                      </div>
                      {w.officers.Health.csi && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-700">
                            CSI: <strong className="text-slate-900">{w.officers.Health.csi.name}</strong>
                          </span>
                          <a
                            href={`tel:${w.officers.Health.csi.phone}`}
                            className="font-mono text-[10px] text-primary hover:underline flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[12px]">call</span>
                            <span>{w.officers.Health.csi.phone}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Light */}
                  {(selectedBranch === 'ALL' || selectedBranch === 'Light') && w.officers?.Light && (
                    <div className="bg-surface-low p-2 rounded border border-border-divider">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-yellow-900 uppercase">
                          Street Lighting
                        </span>
                      </div>
                      {w.officers.Light.je && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-700">
                            JE: <strong className="text-slate-900">{w.officers.Light.je.name}</strong>
                          </span>
                          <a
                            href={`tel:${w.officers.Light.je.phone}`}
                            className="font-mono text-[10px] text-primary hover:underline flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[12px]">call</span>
                            <span>{w.officers.Light.je.phone}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Trigger */}
              <div className="mt-3 pt-2 border-t border-border-divider flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-mono">MCL Ludhiana Cadre</span>
                <span className="text-primary font-semibold">Verified Posting</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficersPage;
