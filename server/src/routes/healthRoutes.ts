import { Router, Request, Response } from 'express';
import { ENV } from '../config/env';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    system: 'MCL Integrated Command & Control Centre (ICCC)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
    slaTargetWorkingHours: ENV.SLA_TARGET_WORKING_HOURS,
  });
});

export default router;

