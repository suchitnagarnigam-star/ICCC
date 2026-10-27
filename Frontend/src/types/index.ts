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

export interface ComplaintCategory {
  id: string;
  name: string;
  branch: DepartmentBranch;
  jointLabel: string;
}

export interface ComplaintAttachment {
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  category: 'source' | 'res' | 'general';
  fileUrl: string;
}

export interface ComplaintTimelineEvent {
  id: string;
  complaintId: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  previousStatus?: ComplaintStatus;
  newStatus?: ComplaintStatus;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  complainantName: string;
  contactNumber: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  branch: DepartmentBranch;
  status: ComplaintStatus;
  mode: string;
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
  dueAt: string;
  assignmentAcknowledgedAt?: string;
  acknowledgedByOfficerId?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  closedAt?: string;
  slaBreached: boolean;
  attachments?: ComplaintAttachment[];
  resolutionProof?: ComplaintAttachment[];
  timeline?: ComplaintTimelineEvent[];
  driveFolderUrl?: string;
}

export interface User {
  userId: string;
  name: string;
  phoneNumber: string;
  role: 'citizen' | 'je' | 'operator' | 'sdo' | 'xen' | 'se' | 'zc' | 'jc' | 'admin';
  designation?: string;
  zone?: string;
  wardNumber?: number;
  branch?: string;
}
