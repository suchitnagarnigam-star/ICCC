import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  SUBMITTED: { label: 'Registered', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  NEEDS_REVIEW: { label: 'Needs Review', bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  ASSIGNED: { label: 'Assigned', bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
  ACKNOWLEDGED: { label: 'Acknowledged', bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' },
  IN_PROGRESS: { label: 'In Progress', bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
  WAITING_FOR_INFORMATION: { label: 'Waiting Info', bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' },
  UNABLE_TO_RESOLVE: { label: 'Unable to Resolve', bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
  RESOLUTION_SUBMITTED: { label: 'Resolution Submitted', bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' },
  UNDER_REVIEW: { label: 'Under Review', bg: '#fdf4ff', text: '#a21caf', border: '#f5d0fe' },
  VERIFICATION_REJECTED: { label: 'Verification Rejected', bg: '#ffe4e6', text: '#e11d48', border: '#fecdd3' },
  CLOSED: { label: 'Closed / Verified', bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  REOPENED: { label: 'Reopened', bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  REJECTED: { label: 'Rejected', bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();
  const cfg = STATUS_CONFIG[norm] || {
    label: status,
    bg: '#f1f5f9',
    text: '#475569',
    border: '#cbd5e1',
  };

  const padding = size === 'sm' ? '2px 8px' : size === 'lg' ? '6px 14px' : '3px 10px';
  const fontSize = size === 'sm' ? '0.72rem' : size === 'lg' ? '0.88rem' : '0.78rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        fontSize,
        fontWeight: 700,
        borderRadius: '9999px',
        backgroundColor: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: cfg.text,
        }}
      />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
