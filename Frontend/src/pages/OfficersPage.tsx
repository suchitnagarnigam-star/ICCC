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
    <div style={{ maxWidth: '1180px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="civic-header" style={{ marginBottom: '1.5rem' }}>
        <span className="brand-badge">MUNICIPAL DIRECTORY</span>
        <h1 className="civic-title" style={{ marginTop: '0.4rem' }}>
          MCL Field Engineers &amp; Officers Directory
        </h1>
        <p className="civic-desc">
          Official territorial directory for all 95 wards across Ludhiana. Direct contact details for Junior Engineers (JE), Sub-Divisional Officers (SDO), and Executive Engineers (XEN).
        </p>
      </div>

      {/* Filter Controls */}
      <div className="civic-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Ward # (e.g. 14), Officer Name, MLA, or Constituency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select
              className="form-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value as any)}
            >
              <option value="ALL">All Departments</option>
              <option value="OM">Operations &amp; Maintenance (Water/Sewer)</option>
              <option value="BR">Building &amp; Roads</option>
              <option value="Health">Health &amp; Sanitation</option>
              <option value="Light">Street Lighting</option>
            </select>
          </div>
          <div>
            <select
              className="form-select"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <option value="">All Zones (A–D)</option>
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
              <option value="C">Zone C</option>
              <option value="D">Zone D</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="civic-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading 95-ward administrative directory...
        </div>
      ) : filteredWards.length === 0 ? (
        <div className="civic-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No wards found matching your search.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredWards.map((item) => (
            <div key={item.ward} className="civic-card" style={{ padding: '1.25rem', borderTop: '3px solid var(--color-primary)' }}>
              {/* Ward Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Zone {item.zone} • {item.constituency || 'Ludhiana'}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--color-primary)' }}>
                    Ward #{item.ward}
                  </h3>
                </div>
                {item.mla && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    {item.mla}
                  </span>
                )}
              </div>

              {/* Officers by Branch */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {/* 1. O&M */}
                {(selectedBranch === 'ALL' || selectedBranch === 'OM') && item.officers?.OM && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #2563EB' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E40AF', marginBottom: '4px' }}>
                      💧 Water Supply &amp; Sewerage (O&amp;M)
                    </div>
                    <div style={{ fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span><strong>Field JE:</strong> {item.officers.OM.je?.name || 'Vacant'}</span>
                        {item.officers.OM.je?.phone && (
                          <a href={`tel:${item.officers.OM.je.phone}`} style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
                            📞 {item.officers.OM.je.phone}
                          </a>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-sub)', fontSize: '0.75rem' }}>
                        <span>SDO: {item.officers.OM.sdo?.name || 'N/A'}</span>
                        {item.officers.OM.sdo?.phone && (
                          <a href={`tel:${item.officers.OM.sdo.phone}`} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                            {item.officers.OM.sdo.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. B&R */}
                {(selectedBranch === 'ALL' || selectedBranch === 'BR') && item.officers?.BR && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #D97706' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B45309', marginBottom: '4px' }}>
                      🛣️ Building &amp; Roads (B&amp;R)
                    </div>
                    <div style={{ fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span><strong>Field JE:</strong> {item.officers.BR.je?.name || 'Vacant'}</span>
                        {item.officers.BR.je?.phone && (
                          <a href={`tel:${item.officers.BR.je.phone}`} style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
                            📞 {item.officers.BR.je.phone}
                          </a>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-sub)', fontSize: '0.75rem' }}>
                        <span>SDO: {item.officers.BR.sdo?.name || 'N/A'}</span>
                        {item.officers.BR.sdo?.phone && (
                          <a href={`tel:${item.officers.BR.sdo.phone}`} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                            {item.officers.BR.sdo.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Health & Sanitation */}
                {(selectedBranch === 'ALL' || selectedBranch === 'Health') && item.officers?.Health && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #059669' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', marginBottom: '4px' }}>
                      🧹 Sanitation &amp; Health
                    </div>
                    <div style={{ fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span><strong>CSI Inspector:</strong> {item.officers.Health.csi?.name || 'Vacant'}</span>
                        {item.officers.Health.csi?.phone && (
                          <a href={`tel:${item.officers.Health.csi.phone}`} style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
                            📞 {item.officers.Health.csi.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Street Lighting */}
                {(selectedBranch === 'ALL' || selectedBranch === 'Light') && item.officers?.Light && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #0D9488' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F766E', marginBottom: '4px' }}>
                      💡 Street Lighting
                    </div>
                    <div style={{ fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span><strong>Field JE:</strong> {item.officers.Light.je?.name || 'Vacant'}</span>
                        {item.officers.Light.je?.phone && (
                          <a href={`tel:${item.officers.Light.je.phone}`} style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
                            📞 {item.officers.Light.je.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficersPage;
