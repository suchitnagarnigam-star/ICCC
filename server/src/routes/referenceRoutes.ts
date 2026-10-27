import { Router, Request, Response } from 'express';
import { getWardDetails, getZoneForWard } from '../services/officerMappingService';
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

router.get('/categories', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: INITIAL_COMPLAINT_CATEGORIES,
    count: INITIAL_COMPLAINT_CATEGORIES.length,
  });
});

router.get('/zones', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: MUNICIPAL_ZONES,
  });
});

router.get('/wards', (req: Request, res: Response) => {
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

export default router;

