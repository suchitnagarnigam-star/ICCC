export type ComplaintStatus =
  | 'SUBMITTED'
  | 'NEEDS_REVIEW'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_INFORMATION'
  | 'UNABLE_TO_RESOLVE'
  | 'RESOLUTION_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFICATION_REJECTED'
  | 'CLOSED'
  | 'REOPENED'
  | 'REJECTED';

export type DepartmentBranch = 'O&M' | 'B&R' | 'Health' | 'Light';

export type ComplaintMode = '24/7 Hotline' | 'WhatsApp Helpline' | 'Command Centre' | 'Citizen Portal' | 'Walk-in';

export interface ComplaintCategory {
  id: string;
  code: string;
  name: string;
  branch: DepartmentBranch;
  jointLabel: string;
  isActive: boolean;
}

export interface ComplaintMedia {
  id: string;
  complaintId: string;
  storageKey: string;
  mediaType: string;
  purpose: 'intake' | 'progress' | 'resolution' | 'dispute';
  uploadedByUserId: string;
  deviceLat?: number;
  deviceLng?: number;
  accuracyMeters?: number;
  locationStatus?: 'captured' | 'permission_denied' | 'unavailable';
  createdAt: string;
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  sourceSystem?: string;
  sourceId?: string;
  citizenId?: string;
  complainantName: string;
  contactNumber: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  branch: DepartmentBranch;
  status: ComplaintStatus;
  mode: ComplaintMode;
  zone?: string;
  subZone?: string;
  wardNumber?: number;
  address?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  assignedJeId?: string;
  assignedJeName?: string;
  assignedJePhone?: string;
  sdoName?: string;
  xenName?: string;
  zcName?: string;
  submittedAt: string;
  acknowledgedAt?: string;
  dueAt: string;
  resolvedAt?: string;
  closedAt?: string;
  slaBreached: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintInput {
  complainantName: string;
  contactNumber: string;
  description: string;
  categoryId: string;
  mode?: ComplaintMode;
  wardNumber?: number;
  zone?: string;
  address?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  media?: {
    storageKey: string;
    mediaType: string;
    deviceLat?: number;
    deviceLng?: number;
    accuracyMeters?: number;
  }[];
}

