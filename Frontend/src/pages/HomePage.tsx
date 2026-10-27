import React from 'react';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentTab }) => {
  return (
    <div>
      <div className="civic-header" style={{ marginBottom: '2rem' }}>
        <h1 className="civic-title">Municipal Grievance Redressal &amp; Operations Portal</h1>
        <p className="civic-desc">
          Unified operational platform serving citizens, field Junior Engineers, desk operators, and executive supervisory officers across Municipal Corporation Ludhiana.
        </p>
      </div>

      <div className="civic-grid">
        <div className="civic-card">
          <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>📢</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            Citizen Grievance Intake
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Submit civic complaints with photo evidence, automatic reverse geocoding, and map pin placement across 15 standard municipal categories.
          </p>
          <button className="btn-primary" onClick={() => setCurrentTab('register')}>
            Register a Complaint &rarr;
          </button>
        </div>

        <div className="civic-card">
          <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🔍</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            Track &amp; Resolution Verification
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Track complaint progress in real-time. Enforces strict citizen verification before ticket closure—disputed resolutions trigger mandatory rework.
          </p>
          <button className="btn-secondary" onClick={() => setCurrentTab('track')}>
            Track Status &rarr;
          </button>
        </div>

        <div className="civic-card">
          <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>📱</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            Field JE Mobile Dispatch
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Mobile-first field workspace for Junior Engineers: assignment acknowledgments, blocker reporting, and resolution submission with after-photo geotags.
          </p>
          <button className="btn-secondary" onClick={() => setCurrentTab('login')}>
            JE Sign In &rarr;
          </button>
        </div>

        <div className="civic-card">
          <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🏢</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            Operator Desk &amp; Triage
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            Control room intake queue, uncertainty assignment resolution, follow-up callback scheduling, and auditable shift handover records.
          </p>
          <button className="btn-secondary" onClick={() => setCurrentTab('login')}>
            Operator Desk &rarr;
          </button>
        </div>
      </div>

      <div className="civic-card" style={{ marginTop: '2rem', backgroundColor: 'var(--color-primary-light)', borderColor: '#BFDBFE' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.4rem' }}>
          ⏱️ Authoritative SLA Standard: 48 Working Hours
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#1E3A8A' }}>
          All civic complaints are monitored against a 48-working-hour resolution target (Monday through Friday, 09:00 to 17:00 IST, excluding Gazetted holidays). Escalation alerts automatically alert the supervisory officer hierarchy (JE &rarr; SDO &rarr; XEN &rarr; SE &rarr; ZC &rarr; JC).
        </p>
      </div>
    </div>
  );
};

