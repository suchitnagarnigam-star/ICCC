export type UserRole =
  | 'citizen'
  | 'je'
  | 'operator'
  | 'sdo'
  | 'xen'
  | 'se'
  | 'zc'
  | 'jc'
  | 'admin';

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  designation?: string;
  employeeCode?: string;
  zone?: string;
  wardNumber?: number;
  branch?: string;
  isActive: boolean;
  isPhoneVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JWTPayload {
  userId: string;
  name: string;
  phoneNumber: string;
  role: UserRole;
  zone?: string;
  wardNumber?: number;
  branch?: string;
  designation?: string;
  allowedWards?: number[];
  isPhoneVerified?: boolean;
}

