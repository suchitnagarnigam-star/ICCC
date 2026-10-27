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
  wardNumber?: number;
  address?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  assignedJeName?: string;
  assignedJePhone?: string;
  submittedAt: string;
  dueAt: string;
  resolvedAt?: string;
  closedAt?: string;
  slaBreached: boolean;
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

