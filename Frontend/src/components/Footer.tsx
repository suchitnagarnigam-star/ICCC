import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <strong>Municipal Corporation Ludhiana (MCL)</strong> &bull; Integrated Command &amp; Control Centre (ICCC)
        </div>
        <div>
          Official Grievance Redressal Portal &bull; Baseline SLA: 48 Working Hours
        </div>
      </div>
    </footer>
  );
};

