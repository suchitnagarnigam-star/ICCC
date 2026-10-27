import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  ComplaintStatus,
  DepartmentBranch,
} from '../types/complaint';
import { INITIAL_COMPLAINT_CATEGORIES } from './referenceRoutes';
import { getZoneForWard } from '../services/officerMappingService';
import { ComplaintRepository, CreateComplaintDbInput } from '../repositories/complaintRepository';
import { UserRepository } from '../repositories/userRepository';
import { calculateWorkingHourDeadline } from '../services/slaService';
import {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeComplaintAction,
} from '../middleware/auth';
import {
  createComplaintDriveFolder,
  uploadComplaintFiles,
  deleteTemporaryFiles,
  TEMP_DIR,
} from '../services/driveService';

const router = Router();

// Multer storage for temporary intake and resolution evidence uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TEMP_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max per file
});

/**
 * GET /api/complaints
 * Filter complaints by status, branch, zone, ward, or search query directly from PostgreSQL.
 * Scoped automatically by authenticated user role and territorial jurisdiction.
 */
router.get('/', optionalAuthenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, branch, zone, wardNumber, search, page, limit } = req.query;

    let allowedWards: number[] | undefined;
    let citizenId: string | undefined;
    let assignedJeId: string | undefined;

    if (req.user) {
      if (req.user.role === 'citizen') {
        citizenId = req.user.userId;
      } else if (req.user.role === 'je') {
        if (req.user.allowedWards && req.user.allowedWards.length > 0) {
          allowedWards = req.user.allowedWards;
        } else {
          assignedJeId = req.user.userId;
        }
      }
    }

    const result = await ComplaintRepository.listComplaints({
      status: status ? String(status) : undefined,
      branch: branch ? String(branch) : undefined,
      zone: zone ? String(zone) : undefined,
      wardNumber: wardNumber ? parseInt(String(wardNumber), 10) : undefined,
      search: search ? String(search) : undefined,
      citizenId,
      assignedJeId,
      allowedWards,
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 50,
    });

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error: any) {
    console.error('[ComplaintRoutes] Error listing complaints:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve complaints from database.' });
  }
});

/**
 * GET /api/complaints/:id
 * Retrieve single complaint with attachments, assigned staff, and timeline from PostgreSQL.
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const complaint = await ComplaintRepository.getComplaintById(id);

    if (!complaint) {
      res.status(404).json({ success: false, error: 'Complaint record not found.' });
      return;
    }

    res.json({
      success: true,
      data: complaint,
    });
  } catch (error: any) {
    console.error(`[ComplaintRoutes] Error fetching complaint ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to retrieve complaint record.' });
  }
});

/**
 * GET /api/complaints/:id/timeline
 * Retrieve chronological audit trail for a complaint.
 */
router.get('/:id/timeline', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const complaint = await ComplaintRepository.getComplaintById(id);

    if (!complaint) {
      res.status(404).json({ success: false, error: 'Complaint not found.' });
      return;
    }

    res.json({
      success: true,
      data: complaint.timeline || [],
    });
  } catch (error: any) {
    console.error(`[ComplaintRoutes] Error fetching timeline for ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Failed to retrieve timeline.' });
  }
});

/**
 * POST /api/complaints
 * Comprehensive multipart complaint registration with auto-routing and background Drive upload.
 * Atomic PostgreSQL transaction across complaints, assignments, timeline, and media ledger.
 */
router.post(
  '/',
  optionalAuthenticateToken,
  upload.fields([
    { name: 'evidence', maxCount: 5 },
    { name: 'evidenceImages', maxCount: 5 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body || {};
    const filesMap = (req.files as Record<string, Express.Multer.File[]>) || {};
    const evidenceFiles: Express.Multer.File[] = [
      ...(filesMap['evidence'] || []),
      ...(filesMap['evidenceImages'] || []),
    ];

    try {
      const complainantName = (body.complainantName || body.citizenName || req.user?.name || '').trim();
      const contactNumber = (body.contactNumber || body.phoneNumber || req.user?.phoneNumber || '').trim();
      const description = (body.description || '').trim();
      const categoryId = String(body.categoryId || '1');
      const wardNumber = body.wardNumber ? parseInt(body.wardNumber, 10) : undefined;
      const address = (body.address || '').trim();
      const landmark = (body.landmark || '').trim();
      const mode = body.mode || (req.user?.role === 'citizen' ? 'Citizen App' : 'Citizen Portal');

      if (!complainantName || !contactNumber || !description) {
        void deleteTemporaryFiles(evidenceFiles);
        res.status(400).json({
          success: false,
          error: 'Required fields missing: complainantName, contactNumber, description.',
        });
        return;
      }

      // Resolve Category and Municipal Branch
      const category = INITIAL_COMPLAINT_CATEGORIES.find((c) => c.id === categoryId);
      const branch: DepartmentBranch = category ? (category.branch as DepartmentBranch) : 'O&M';
      const categoryName = category ? category.name : 'General Grievance';

      // Server-side zone validation and automatic derivation
      const derivedZone = wardNumber ? getZoneForWard(wardNumber) || body.zone : body.zone;

      // Auto-assign Field Officer from live Database Roster (staff_area_assignments)
      let assignedOfficerUser = wardNumber ? await UserRepository.findOfficerForWardAndBranch(wardNumber, branch) : null;

      // 48-Working-Hour SLA Engine (Mon-Fri 09:00-17:00 IST, holiday & weekend exclusion)
      const dueAt = calculateWorkingHourDeadline(new Date(), 48).toISOString();

      // Prepare Initial Media records
      const initialMedia = evidenceFiles.map((f, idx) => ({
        storageKey: `temp-${Date.now()}-${idx}-${path.basename(f.filename)}`,
        mediaType: f.mimetype || 'image/jpeg',
        size: f.size,
        fileName: f.originalname,
        purpose: 'intake' as const,
        uploadState: 'pending' as const,
      }));

      const createInput: CreateComplaintDbInput = {
        complainantName,
        contactNumber,
        description,
        categoryId,
        categoryName,
        branch,
        mode,
        zone: derivedZone,
        wardNumber,
        address,
        landmark,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
        dueAt,
        citizenId: req.user?.role === 'citizen' ? req.user.userId : (body.citizenId || undefined),
        assignedJeId: assignedOfficerUser?.id,
        sourceSystem: 'ICCC_WEB',
        initialMedia,
      };

      const createdComplaint = await ComplaintRepository.createComplaint(createInput);

      // Return HTTP 201 immediately so citizen/UI receives tracking number without waiting
      res.status(201).json({
        success: true,
        message: 'Grievance registered successfully.',
        data: createdComplaint,
      });

      // Background Processing (Drive folder, file sync, cleanup, and DB media status update)
      void (async () => {
        try {
          if (evidenceFiles.length > 0) {
            await createComplaintDriveFolder(createdComplaint.complaintNumber);
            const uploadedFiles = await uploadComplaintFiles(createdComplaint.complaintNumber, 'source', evidenceFiles);

            for (let i = 0; i < uploadedFiles.length; i++) {
              const u = uploadedFiles[i];
              const origMedia = initialMedia[i];
              if (origMedia && u) {
                await ComplaintRepository.updateMediaUploadState(
                  origMedia.storageKey,
                  'uploaded',
                  u.fileId
                );
              }
            }
          }
        } catch (err: any) {
          console.error(`[BackgroundSync] Upload failed for ${createdComplaint.complaintNumber}:`, err);
          for (const m of initialMedia) {
            await ComplaintRepository.updateMediaUploadState(
              m.storageKey,
              'failed',
              undefined,
              err?.message || 'Drive upload error'
            );
          }
        } finally {
          void deleteTemporaryFiles(evidenceFiles);
        }
      })();
    } catch (error: any) {
      void deleteTemporaryFiles(evidenceFiles);
      console.error('[ComplaintRoutes] Error submitting complaint:', error);
      res.status(500).json({ success: false, error: 'Internal server error while registering grievance.' });
    }
  }
);

/**
 * POST /api/complaints/:id/acknowledge
 * Field officer acknowledges assigned complaint in PostgreSQL, locking response clock.
 * Requires authenticated session and territorial authorization.
 */
router.post(
  '/:id/acknowledge',
  authenticateToken,
  authorizeComplaintAction('acknowledge'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const complaint = await ComplaintRepository.getComplaintById(id);

      if (!complaint) {
        res.status(404).json({ success: false, error: 'Complaint not found.' });
        return;
      }

      const officerId = req.user!.userId;
      const updated = await ComplaintRepository.acknowledgeComplaint(complaint.id, officerId);

      res.json({
        success: true,
        message: 'Assignment acknowledged successfully.',
        data: updated,
      });
    } catch (error: any) {
      console.error(`[ComplaintRoutes] Error acknowledging complaint ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message || 'Failed to acknowledge assignment.' });
    }
  }
);

/**
 * POST /api/complaints/:id/status
 * Update complaint status (e.g. IN_PROGRESS, ESCALATED) with mandatory remarks.
 * Requires authenticated session and territorial authorization.
 */
router.post(
  '/:id/status',
  authenticateToken,
  authorizeComplaintAction('update'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const complaint = await ComplaintRepository.getComplaintById(id);

      if (!complaint) {
        res.status(404).json({ success: false, error: 'Complaint not found.' });
        return;
      }

      const { status, remarks } = req.body;
      if (!status) {
        res.status(400).json({ success: false, error: 'Target status is required.' });
        return;
      }

      const updated = await ComplaintRepository.updateStatus(
        complaint.id,
        status as ComplaintStatus,
        remarks || `Status transitioned to ${status}`,
        req.user!.userId
      );

      res.json({
        success: true,
        message: `Status updated to ${status}.`,
        data: updated,
      });
    } catch (error: any) {
      console.error(`[ComplaintRoutes] Error updating status for ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message || 'Failed to update complaint status.' });
    }
  }
);

/**
 * POST /api/complaints/:id/assign
 * Supervisor or Control Room reassigns complaint to another officer with mandatory audit reason.
 * Requires authenticated supervisor/operator session.
 */
router.post(
  '/:id/assign',
  authenticateToken,
  authorizeComplaintAction('reassign'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const complaint = await ComplaintRepository.getComplaintById(id);

      if (!complaint) {
        res.status(404).json({ success: false, error: 'Complaint not found.' });
        return;
      }

      const { officerName, officerPhone, officerId, reason } = req.body;
      const targetOfficerIdentifier = officerId || officerPhone || officerName;

      if (!targetOfficerIdentifier) {
        res.status(400).json({ success: false, error: 'Target officer identifier (id or phone) is required.' });
        return;
      }

      const updated = await ComplaintRepository.reassignComplaint(
        complaint.id,
        targetOfficerIdentifier,
        reason || 'Administrative reassignment',
        req.user!.userId
      );

      res.json({
        success: true,
        message: `Complaint reassigned successfully.`,
        data: updated,
      });
    } catch (error: any) {
      console.error(`[ComplaintRoutes] Error reassigning complaint ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message || 'Failed to reassign complaint.' });
    }
  }
);

/**
 * POST /api/complaints/:id/resolution
 * Field officer submits resolution description along with completion photos.
 * Requires authenticated session and territorial assignment check.
 */
router.post(
  '/:id/resolution',
  authenticateToken,
  authorizeComplaintAction('resolve'),
  upload.fields([{ name: 'resolutionProof', maxCount: 5 }]),
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const filesMap = (req.files as Record<string, Express.Multer.File[]>) || {};
    const proofFiles = filesMap['resolutionProof'] || [];

    try {
      const complaint = await ComplaintRepository.getComplaintById(id);

      if (!complaint) {
        void deleteTemporaryFiles(proofFiles);
        res.status(404).json({ success: false, error: 'Complaint not found.' });
        return;
      }

      const body = req.body || {};
      const resolutionNotes = (body.resolutionNotes || body.notes || '').trim();
      const officerId = req.user!.userId;

      if (!resolutionNotes) {
        void deleteTemporaryFiles(proofFiles);
        res.status(400).json({ success: false, error: 'Resolution description is required.' });
        return;
      }

      const proofStorageKeys = proofFiles.map(
        (f, idx) => `res-${Date.now()}-${idx}-${path.basename(f.filename)}`
      );

      const updated = await ComplaintRepository.submitResolution(
        complaint.id,
        resolutionNotes,
        officerId,
        proofStorageKeys
      );

      res.json({
        success: true,
        message: 'Resolution submitted successfully for verification.',
        data: updated,
      });

      // Background Drive upload for resolution proof
      void (async () => {
        try {
          if (proofFiles.length > 0) {
            const uploaded = await uploadComplaintFiles(complaint.complaintNumber, 'res', proofFiles);
            for (let i = 0; i < uploaded.length; i++) {
              const u = uploaded[i];
              const origKey = proofStorageKeys[i];
              if (origKey && u) {
                await ComplaintRepository.updateMediaUploadState(origKey, 'uploaded', u.fileId);
              }
            }
          }
        } catch (err: any) {
          console.error(`[BackgroundSync] Resolution upload failed for ${complaint.complaintNumber}:`, err);
          for (const k of proofStorageKeys) {
            await ComplaintRepository.updateMediaUploadState(k, 'failed', undefined, err?.message);
          }
        } finally {
          void deleteTemporaryFiles(proofFiles);
        }
      })();
    } catch (error: any) {
      void deleteTemporaryFiles(proofFiles);
      console.error(`[ComplaintRoutes] Error submitting resolution for ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message || 'Failed to submit resolution.' });
    }
  }
);

/**
 * POST /api/complaints/:id/verify-close
 * Citizen or Control Room quality verification to permanently close grievance.
 * Requires authenticated session and role authorization.
 */
router.post(
  '/:id/verify-close',
  authenticateToken,
  authorizeComplaintAction('verify'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const complaint = await ComplaintRepository.getComplaintById(id);

      if (!complaint) {
        res.status(404).json({ success: false, error: 'Complaint not found.' });
        return;
      }

      const { rating, feedback, verdict } = req.body;
      const verificationVerdict = (verdict === 'disputed' || verdict === 'rejected') ? 'disputed' : 'accepted';
      const comments = feedback || (rating ? `Citizen Rating: ${rating}/5` : 'Closure confirmed');

      const updated = await ComplaintRepository.verifyAndClose(
        complaint.id,
        req.user!.userId,
        (req.user!.role === 'citizen' ? 'citizen' : 'officer'),
        verificationVerdict,
        comments
      );

      res.json({
        success: true,
        message: verificationVerdict === 'accepted' ? 'Grievance verified and permanently closed.' : 'Resolution disputed and reopened.',
        data: updated,
      });
    } catch (error: any) {
      console.error(`[ComplaintRoutes] Error verifying complaint ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message || 'Failed to verify complaint.' });
    }
  }
);

/**
 * POST /api/complaints/:id/pause
 * Field Officer or Supervisor freezes SLA clock with mandatory reason.
 */
router.post(
  '/:id/pause',
  authenticateToken,
  authorizeComplaintAction('update'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const { reason } = req.body;

      if (!reason || !String(reason).trim()) {
        res.status(400).json({ success: false, error: 'Pause reason is required.' });
        return;
      }

      const updated = await ComplaintRepository.pauseComplaint(id, String(reason).trim(), req.user!.userId);

      res.json({
        success: true,
        message: 'SLA clock paused successfully.',
        data: updated,
      });
    } catch (error: any) {
      console.error(`[ComplaintRoutes] Error pausing complaint ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message || 'Failed to pause SLA clock.' });
    }
  }
);

/**
 * POST /api/complaints/:id/resume
 * Field Officer or Supervisor resumes SLA clock, extending deadline by elapsed pause duration.
 */
router.post(
  '/:id/resume',
  authenticateToken,
  authorizeComplaintAction('update'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const updated = await ComplaintRepository.resumeComplaint(id, req.user!.userId);

      res.json({
        success: true,
        message: 'SLA clock resumed successfully.',
        data: updated,
      });
    } catch (error: any) {
      console.error(`[ComplaintRoutes] Error resuming complaint ${req.params.id}:`, error);
      res.status(500).json({ success: false, error: error.message || 'Failed to resume SLA clock.' });
    }
  }
);

export default router;
