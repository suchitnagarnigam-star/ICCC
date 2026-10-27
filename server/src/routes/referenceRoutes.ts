import { Router, Request, Response } from 'express';
import { getWardDetails, getZoneForWard } from '../services/officerMappingService';
import { getDbPool } from '../config/db';
import wardDataRaw from '../data/wardMasterData.json';

const router = Router();

export const INITIAL_COMPLAINT_CATEGORIES = [
  { id: '1', name: 'Blocked Road Gully', branch: 'O&M', jointLabel: 'Blocked Road Gully - O&M' },
  { id: '2', name: 'Open Manhole', branch: 'O&M', jointLabel: 'Open Manhole - O&M' },
  { id: '3', name: 'Water Logging', branch: 'O&M', jointLabel: 'Water Logging - O&M' },
  { id: '4', name: 'Tree Fall', branch: 'Health', jointLabel: 'Tree Fall - Health' },
  { id: '5', name: 'Contamination', branch: 'O&M', jointLabel: 'Contamination - O&M' },
  { id: '6', name: 'Potholes', branch: 'B&R', jointLabel: 'Potholes - B&R' },
  { id: '7', name: 'New Road Construction', branch: 'B&R', jointLabel: 'New Road Construction - B&R' },
  { id: '8', name: 'Garbage Valnuerable Points (GVP)', branch: 'Health', jointLabel: 'Garbage Valnuerable Points (GVP) - Health' },
  { id: '9', name: 'New Pipeline Water/Sewer', branch: 'O&M', jointLabel: 'New Pipeline Water/Sewer - O&M' },
  { id: '10', name: 'Old Pipeline Burst', branch: 'O&M', jointLabel: 'Old Pipeline Burst - O&M' },
  { id: '11', name: 'Leakage Pipeline', branch: 'O&M', jointLabel: 'Leakage Pipeline - O&M' },
  { id: '12', name: 'Sewerage/Road Jalis Overchock.', branch: 'O&M', jointLabel: 'Sewerage/Road Jalis Overchock. - O&M' },
  { id: '13', name: 'Sewerage/Road Jalis Desiliting', branch: 'O&M', jointLabel: 'Sewerage/Road Jalis Desiliting - O&M' },
  { id: '14', name: 'Street Light Issues', branch: 'Light', jointLabel: 'Street Light Issues - Light' },
  { id: '15', name: 'New road gully', branch: 'B&R', jointLabel: 'New road gully - B&R' },
];

export const MUNICIPAL_ZONES = [
  { zone: 'A', commissioner: 'Sh.Amanpreet Singh, PCS', wards: Array.from({ length: 24 }, (_, i) => i + 1) },
  { zone: 'B', commissioner: 'Sh.Niraj Jain, AC', wards: Array.from({ length: 24 }, (_, i) => i + 25) },
  { zone: 'C', commissioner: 'Sh.Gurpal , AC', wards: Array.from({ length: 24 }, (_, i) => i + 49) },
  { zone: 'D', commissioner: 'Sh.Jasdev Sekhon, AC', wards: Array.from({ length: 23 }, (_, i) => i + 73) },
];

router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const pool = getDbPool();
    const catRes = await pool.query<any>(
      'SELECT id, code, name, branch, is_active FROM complaint_categories WHERE is_active = TRUE ORDER BY code ASC'
    );
    if (catRes.rows.length > 0) {
      const cats = catRes.rows.map((c: any) => ({
        id: c.code.replace('cat_', ''),
        code: c.code,
        uuid: c.id,
        name: c.name,
        branch: c.branch,
        jointLabel: `${c.name} - ${c.branch}`,
      }));
      res.json({
        success: true,
        data: cats,
        count: cats.length,
      });
      return;
    }
  } catch (err) {
    // Database fallback
  }

  res.json({
    success: true,
    data: INITIAL_COMPLAINT_CATEGORIES,
    count: INITIAL_COMPLAINT_CATEGORIES.length,
  });
});

router.get('/zones', async (_req: Request, res: Response) => {
  try {
    const pool = getDbPool();
    const zonesRes = await pool.query<{ zone_code: string; commissioner_name: string }>(
      'SELECT zone_code, commissioner_name FROM municipal_zones ORDER BY zone_code ASC'
    );
    const wardsRes = await pool.query<{ ward_number: number; zone_code: string }>(
      'SELECT ward_number, zone_code FROM municipal_wards ORDER BY ward_number ASC'
    );

    if (zonesRes.rows.length > 0) {
      const wardsByZone = new Map<string, number[]>();
      for (const w of wardsRes.rows) {
        if (!wardsByZone.has(w.zone_code)) wardsByZone.set(w.zone_code, []);
        wardsByZone.get(w.zone_code)!.push(w.ward_number);
      }

      const zonesData = zonesRes.rows.map((z) => ({
        zone: z.zone_code,
        commissioner: z.commissioner_name,
        wards: wardsByZone.get(z.zone_code) || [],
      }));

      res.json({
        success: true,
        data: zonesData,
      });
      return;
    }
  } catch (err) {
    // Database fallback
  }

  res.json({
    success: true,
    data: MUNICIPAL_ZONES,
  });
});

router.get('/wards', async (_req: Request, res: Response) => {
  try {
    const pool = getDbPool();
    const wardsRes = await pool.query<any>(
      `SELECT mw.ward_number, mw.zone_code as zone, mw.ward_name, mw.area_sq_km, mw.estimated_population,
              mz.commissioner_name
       FROM municipal_wards mw
       LEFT JOIN municipal_zones mz ON mw.zone_code = mz.zone_code
       ORDER BY mw.ward_number ASC`
    );

    if (wardsRes.rows.length > 0) {
      res.json({
        success: true,
        data: wardsRes.rows,
        total: wardsRes.rows.length,
      });
      return;
    }
  } catch (err) {
    // Database fallback
  }

  res.json({
    success: true,
    data: wardDataRaw,
    total: (wardDataRaw as any[]).length,
  });
});

router.get('/wards/:wardNumber', (req: Request, res: Response): void => {
  const wardNum = parseInt(req.params.wardNumber, 10);
  if (isNaN(wardNum)) {
    res.status(400).json({ success: false, error: 'Invalid ward number.' });
    return;
  }
  const details = getWardDetails(wardNum);
  if (!details) {
    res.status(404).json({ success: false, error: 'Ward not found.' });
    return;
  }
  res.json({
    success: true,
    data: details,
  });
});

router.get('/officers', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: wardDataRaw,
    total: (wardDataRaw as any[]).length,
  });
});

export default router;
