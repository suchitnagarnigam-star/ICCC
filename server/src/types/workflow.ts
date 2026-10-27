import { ComplaintStatus } from './complaint';

export interface StateTransitionRequest {
  complaintId: string;
  targetStatus: ComplaintStatus;
  actorUserId: string;
  reason?: string;
  notes?: string;
  resolutionEvidence?: {
    afterPhotos: string[];
    deviceLat?: number;
    deviceLng?: number;
    accuracyMeters?: number;
    locationStatus?: 'captured' | 'permission_denied' | 'unavailable';
  };
  blockerDetails?: {
    blockerCategory: 'legal_stay' | 'technical_hurdle' | 'fund_allocation' | 'other_department';
    blockerDescription: string;
    escalateTo: 'sdo' | 'xen';
  };
  verificationDetails?: {
    verifierRole: 'citizen' | 'officer';
    result: 'accepted' | 'disputed';
    comments?: string;
  };
}

export interface StateTransitionResult {
  success: boolean;
  complaintId: string;
  previousStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  transitionTime: string;
  message?: string;
}

export interface ShiftHandoverRecord {
  id: string;
  outgoingOperatorId: string;
  outgoingOperatorName: string;
  incomingOperatorId?: string;
  incomingOperatorName?: string;
  shiftStartTime: string;
  shiftEndTime: string;
  pendingCasesCount: number;
  overdueCasesCount: number;
  openComplaintsList: string[];
  handoverNotes: string;
  acknowledgedAt?: string;
}

