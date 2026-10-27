import { ComplaintStatus } from '../types/complaint';
import { UserRole } from '../types/user';

/**
 * Valid complaint statuses recognized by the MCL ICCC platform.
 */
export const VALID_COMPLAINT_STATUSES: Set<ComplaintStatus> = new Set([
  'SUBMITTED',
  'NEEDS_REVIEW',
  'ASSIGNED',
  'ACKNOWLEDGED',
  'IN_PROGRESS',
  'WAITING_FOR_INFORMATION',
  'UNABLE_TO_RESOLVE',
  'RESOLUTION_SUBMITTED',
  'UNDER_REVIEW',
  'VERIFICATION_REJECTED',
  'CLOSED',
  'REOPENED',
  'REJECTED',
]);

/**
 * Permitted status transitions graph for municipal grievance resolution.
 */
export const PERMITTED_STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  SUBMITTED: ['NEEDS_REVIEW', 'ASSIGNED', 'REJECTED'],
  NEEDS_REVIEW: ['ASSIGNED', 'REJECTED'],
  ASSIGNED: ['ACKNOWLEDGED', 'IN_PROGRESS', 'WAITING_FOR_INFORMATION', 'NEEDS_REVIEW', 'REJECTED'],
  ACKNOWLEDGED: ['IN_PROGRESS', 'WAITING_FOR_INFORMATION', 'UNABLE_TO_RESOLVE', 'RESOLUTION_SUBMITTED'],
  IN_PROGRESS: ['WAITING_FOR_INFORMATION', 'UNABLE_TO_RESOLVE', 'RESOLUTION_SUBMITTED'],
  WAITING_FOR_INFORMATION: ['IN_PROGRESS', 'UNABLE_TO_RESOLVE', 'RESOLUTION_SUBMITTED'],
  UNABLE_TO_RESOLVE: ['IN_PROGRESS', 'ASSIGNED', 'NEEDS_REVIEW', 'REOPENED'],
  RESOLUTION_SUBMITTED: ['UNDER_REVIEW', 'CLOSED', 'VERIFICATION_REJECTED'],
  UNDER_REVIEW: ['CLOSED', 'VERIFICATION_REJECTED', 'IN_PROGRESS'],
  VERIFICATION_REJECTED: ['IN_PROGRESS', 'ASSIGNED', 'REOPENED'],
  REOPENED: ['ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS'],
  CLOSED: ['REOPENED'],
  REJECTED: ['REOPENED', 'NEEDS_REVIEW'],
};

/**
 * Workflows that require specialized endpoints with cryptographic audit proofs or citizen verification.
 * Direct status updates to these targets are blocked at the FSM boundary.
 */
export const GATED_STATUS_ENDPOINTS: Record<string, string> = {
  CLOSED: 'POST /api/complaints/:id/verify-close (Requires citizen or control room quality audit confirmation)',
  VERIFICATION_REJECTED: 'POST /api/complaints/:id/verify-close (Requires formal citizen or QA dispute reason)',
  RESOLUTION_SUBMITTED: 'POST /api/complaints/:id/resolution (Requires field work description and photographic evidence)',
  ACKNOWLEDGED: 'POST /api/complaints/:id/acknowledge (Requires assigned officer digital handshake)',
};

export interface TransitionValidationResult {
  allowed: boolean;
  error?: string;
}

/**
 * Validates whether a requested status transition is permitted from the current status,
 * considering the calling actor's role and workflow gating requirements.
 */
export function validateStatusTransition(
  currentStatus: ComplaintStatus,
  targetStatus: ComplaintStatus,
  actorRole: UserRole,
  isSpecializedWorkflow: boolean = false
): TransitionValidationResult {
  if (!VALID_COMPLAINT_STATUSES.has(targetStatus)) {
    return {
      allowed: false,
      error: `Invalid status: '${targetStatus}' is not a recognized complaint status.`,
    };
  }

  if (currentStatus === targetStatus) {
    return {
      allowed: false,
      error: `Complaint is already in '${currentStatus}' status.`,
    };
  }

  // 1. Check if target status requires a specialized workflow endpoint
  if (!isSpecializedWorkflow && GATED_STATUS_ENDPOINTS[targetStatus]) {
    return {
      allowed: false,
      error: `Direct status transition to '${targetStatus}' is forbidden. Use the specialized workflow: ${GATED_STATUS_ENDPOINTS[targetStatus]}.`,
    };
  }

  // 2. Check transition graph
  const allowedNextStatuses = PERMITTED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedNextStatuses.includes(targetStatus)) {
    return {
      allowed: false,
      error: `Illegal state transition: Cannot transition grievance from '${currentStatus}' to '${targetStatus}'. Permitted transitions: [${allowedNextStatuses.join(', ')}].`,
    };
  }

  // 3. Role-based operational transition guardrails
  if (actorRole === 'citizen') {
    if (!isSpecializedWorkflow && targetStatus !== 'REOPENED') {
      return {
        allowed: false,
        error: 'Forbidden: Citizens cannot modify officer operational status.',
      };
    }
  }

  if (actorRole === 'je') {
    const allowedJeStatuses: ComplaintStatus[] = [
      'ACKNOWLEDGED',
      'IN_PROGRESS',
      'WAITING_FOR_INFORMATION',
      'UNABLE_TO_RESOLVE',
      'RESOLUTION_SUBMITTED',
    ];
    if (!allowedJeStatuses.includes(targetStatus)) {
      return {
        allowed: false,
        error: `Forbidden: Field officers (JE) cannot transition grievances to '${targetStatus}'. Allowed: [${allowedJeStatuses.join(', ')}].`,
      };
    }
  }

  return { allowed: true };
}
