import wardDataRaw from '../data/wardMasterData.json';
import { DepartmentBranch } from '../types/complaint';

export interface OfficerContact {
  name: string;
  phone: string;
  designation?: string;
  id?: string;
}

export interface WardHierarchy {
  ward: number;
  zone: 'A' | 'B' | 'C' | 'D';
  constituency: string;
  mla: string;
  officers: {
    BR: { se: OfficerContact; xen: OfficerContact; sdo: OfficerContact; je: OfficerContact };
    OM: { se: OfficerContact; xen: OfficerContact; sdo: OfficerContact; je: OfficerContact };
    Health: { drNodal: OfficerContact; moh: OfficerContact; csi: OfficerContact };
    Light: { sdo: OfficerContact; je: OfficerContact };
  };
}

export interface ResolvedOfficerAssignment {
  primaryOfficerId: string;
  primaryOfficerName: string;
  primaryOfficerPhone: string;
  designation: string;
  branch: DepartmentBranch;
  supervisingSdoName?: string;
  supervisingSdoPhone?: string;
  supervisingXenName?: string;
  supervisingXenPhone?: string;
  zone: 'A' | 'B' | 'C' | 'D';
}

const WARD_MAP = new Map<number, WardHierarchy>();

// Load ward directory
for (const entry of wardDataRaw as unknown as WardHierarchy[]) {
  WARD_MAP.set(entry.ward, entry);
}

/**
 * Get full administrative hierarchy for a given Ward (1-95)
 */
export function getWardDetails(wardNumber: number): WardHierarchy | undefined {
  return WARD_MAP.get(wardNumber);
}

/**
 * Derive Zone (A, B, C, D) strictly from Ward Number
 */
export function getZoneForWard(wardNumber: number): 'A' | 'B' | 'C' | 'D' | null {
  const ward = WARD_MAP.get(wardNumber);
  return ward ? ward.zone : null;
}

/**
 * Resolve the designated field officer (JE or CSI) and their supervisory chain
 * based on Ward Number and Municipal Department Branch.
 */
export function resolveAssignedOfficer(
  wardNumber: number,
  branch: DepartmentBranch
): ResolvedOfficerAssignment | null {
  const ward = WARD_MAP.get(wardNumber);
  if (!ward) return null;

  const zone = ward.zone;

  if (branch === 'B&R') {
    const o = ward.officers.BR;
    const jeName = o.je.name || 'Junior Engineer (B&R)';
    const jePhone = o.je.phone || '';
    const id = `je-br-w${wardNumber}`;

    return {
      primaryOfficerId: id,
      primaryOfficerName: `${jeName} (JE B&R)`,
      primaryOfficerPhone: jePhone,
      designation: 'Junior Engineer (B&R)',
      branch: 'B&R',
      supervisingSdoName: o.sdo.name,
      supervisingSdoPhone: o.sdo.phone,
      supervisingXenName: o.xen.name,
      supervisingXenPhone: o.xen.phone,
      zone,
    };
  }

  if (branch === 'O&M') {
    const o = ward.officers.OM;
    const jeName = o.je.name || 'Junior Engineer (O&M)';
    const jePhone = o.je.phone || '';
    const id = `je-om-w${wardNumber}`;

    return {
      primaryOfficerId: id,
      primaryOfficerName: `${jeName} (JE O&M)`,
      primaryOfficerPhone: jePhone,
      designation: 'Junior Engineer (O&M)',
      branch: 'O&M',
      supervisingSdoName: o.sdo.name,
      supervisingSdoPhone: o.sdo.phone,
      supervisingXenName: o.xen.name,
      supervisingXenPhone: o.xen.phone,
      zone,
    };
  }

  if (branch === 'Health') {
    const o = ward.officers.Health;
    const csiName = o.csi.name || o.moh.name || 'Chief Sanitary Inspector';
    const csiPhone = o.csi.phone || o.moh.phone || '';
    const id = `csi-health-w${wardNumber}`;

    return {
      primaryOfficerId: id,
      primaryOfficerName: `${csiName} (CSI Health)`,
      primaryOfficerPhone: csiPhone,
      designation: 'Chief Sanitary Inspector',
      branch: 'Health',
      supervisingSdoName: o.moh.name,
      supervisingSdoPhone: o.moh.phone,
      supervisingXenName: o.drNodal.name,
      supervisingXenPhone: o.drNodal.phone,
      zone,
    };
  }

  if (branch === 'Light') {
    const o = ward.officers.Light;
    const jeName = o.je.name || 'Junior Engineer (Light)';
    const jePhone = o.je.phone || '';
    const id = `je-light-w${wardNumber}`;

    return {
      primaryOfficerId: id,
      primaryOfficerName: `${jeName} (JE Light)`,
      primaryOfficerPhone: jePhone,
      designation: 'Junior Engineer (Light)',
      branch: 'Light',
      supervisingSdoName: o.sdo.name,
      supervisingSdoPhone: o.sdo.phone,
      zone,
    };
  }

  return null;
}
