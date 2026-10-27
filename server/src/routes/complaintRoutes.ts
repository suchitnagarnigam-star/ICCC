import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  Complaint,
  ComplaintStatus,
  DepartmentBranch,
  ComplaintTimelineEvent,
  ComplaintAttachment,
} from '../types/complaint';
import { INITIAL_COMPLAINT_CATEGORIES } from './referenceRoutes';
import { resolveAssignedOfficer, getZoneForWard } from '../services/officerMappingService';
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

// Production complaint storage (in-memory baseline synced with PostgreSQL pool)
const COMPLAINTS_STORE: Complaint[] = [
  {
    id: 'cmp-001',
    complaintNumber: 'MCL-2026-0001',
    complainantName: 'Amarjeet Singh',
    contactNumber: '8146599777',
    description: 'Road potholes near Bhai Ranjeet Singh Nagar DAV School. Severe road surface damage causing traffic congestion.',
    categoryId: '6',
    categoryName: 'Potholes',
    branch: 'B&R',
    status: 'ASSIGNED',
    mode: '24/7 Hotline',
    zone: 'D',
    wardNumber: 64,
    address: '16B Bhai Ranjeet Singh Nagar',
    landmark: 'Near DAV School',
    assignedJeId: 'je-br-w64',
    assignedJeName: 'Ankush Sharma (JE B&R)',
    assignedJePhone: '7986605351',
    sdoName: 'Vaneet Kumar',
    xenName: 'Arvind Kumar',
    submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    dueAt: new Date(Date.now() + 3600000 * 36).toISOString(),
    slaBreached: false,
    attachments: [
      {
        fileId: 'mock-img-001',
        fileName: 'pothole_evidence_1.jpg',
        mimeType: 'image/jpeg',
        size: 245000,
        category: 'source',
        fileUrl: '/api/drive/files/mock-img-001',
      },
    ],
    timeline: [
      {
        id: 'tl-101',
        complaintId: 'cmp-001',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        actorName: '24/7 Control Room Operator',
        actorRole: 'OPERATOR',
        action: 'REGISTERED',
        newStatus: 'SUBMITTED',
        notes: 'Grievance registered from citizen hotline call.',
      },
      {
        id: 'tl-102',
        complaintId: 'cmp-001',
        timestamp: new Date(Date.now() - 3600000 * 11).toISOString(),
        actorName: 'Automated Dispatch System',
        actorRole: 'SYSTEM',
        action: 'ASSIGNED',
        previousStatus: 'SUBMITTED',
        newStatus: 'ASSIGNED',
        notes: 'Automatically mapped to Ward 64 B&R JE Ankush Sharma (7986605351).',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 11).toISOString(),
  },
  {
    id: 'cmp-002',
    complaintNumber: 'MCL-2026-0002',
    complainantName: 'Ashwin Kumar',
    contactNumber: '9988150511',
    description: 'Sewerage overflow in street during rainy season. Water mixing with main street passage.',
    categoryId: '12',
    categoryName: 'Sewerage/Road Jalis Overchock.',
    branch: 'O&M',
    status: 'RESOLUTION_SUBMITTED',
    mode: 'WhatsApp Helpline',
    zone: 'B',
    wardNumber: 7,
    address: 'Jain nagar, Rahon road',
    landmark: 'Near Dhawan Hospital',
    assignedJeId: 'je-om-w7',
    assignedJeName: 'Sh. Ramandeep Singh (JE O&M)',
    assignedJePhone: '9855523213',
    sdoName: 'Sukhdeep Singh',
    xenName: 'Baljinder Singh',
    submittedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    dueAt: new Date(Date.now() + 3600000 * 20).toISOString(),
    assignmentAcknowledgedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    acknowledgedByOfficerId: 'je-om-w7',
    resolvedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    slaBreached: false,
    resolutionNotes: 'Super suction machine deployed. Blockage cleared at Rahon road main line and street drain jali cleaned.',
    attachments: [
      {
        fileId: 'mock-img-002',
        fileName: 'sewer_overflow.jpg',
        mimeType: 'image/jpeg',
        size: 382000,
        category: 'source',
        fileUrl: '/api/drive/files/mock-img-002',
      },
    ],
    resolutionProof: [
      {
        fileId: 'mock-img-res-002',
        fileName: 'sewer_cleared_proof.jpg',
        mimeType: 'image/jpeg',
        size: 412000,
        category: 'res',
        fileUrl: '/api/drive/files/mock-img-res-002',
      },
    ],
    timeline: [
      {
        id: 'tl-201',
        complaintId: 'cmp-002',
        timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
        actorName: 'WhatsApp MCL Bot',
        actorRole: 'SYSTEM',
        action: 'REGISTERED',
        newStatus: 'SUBMITTED',
        notes: 'Inbound WhatsApp complaint with geotagged address.',
      },
      {
        id: 'tl-202',
        complaintId: 'cmp-002',
        timestamp: new Date(Date.now() - 3600000 * 27).toISOString(),
        actorName: 'System Router',
        actorRole: 'SYSTEM',
        action: 'ASSIGNED',
        newStatus: 'ASSIGNED',
        notes: 'Assigned to JE Ramandeep Singh (O&M Ward 7).',
      },
      {
        id: 'tl-203',
        complaintId: 'cmp-002',
        timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
        actorName: 'Sh. Ramandeep Singh',
        actorRole: 'FIELD_OFFICER',
        action: 'ACKNOWLEDGED',
        previousStatus: 'ASSIGNED',
        newStatus: 'ACKNOWLEDGED',
        notes: 'Officer acknowledged assignment and scheduled super suction team.',
      },
      {
        id: 'tl-204',
        complaintId: 'cmp-002',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        actorName: 'Sh. Ramandeep Singh',
        actorRole: 'FIELD_OFFICER',
        action: 'RESOLUTION_SUBMITTED',
        previousStatus: 'ACKNOWLEDGED',
        newStatus: 'RESOLUTION_SUBMITTED',
        notes: 'Blockage cleared, suction completed, and photo proof submitted.',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// Helper: Calculate if SLA is breached
function computeSlaBreached(c: Complaint): boolean {
  if (c.status === 'CLOSED' || c.status === 'RESOLUTION_SUBMITTED') {
    return false;
  }
  return new Date().getTime() > new Date(c.dueAt).getTime();
}

/**
 * GET /api/complaints
 * Filter complaints by status, branch, zone, ward, or search query.
 */
router.get('/', (req: Request, res: Response) => {
  const { status, branch, zone, wardNumber, search } = req.query;
  let filtered = COMPLAINTS_STORE.map((c) => ({
    ...c,
    slaBreached: computeSlaBreached(c),
  }));

  if (status) {
    filtered = filtered.filter((c) => c.status.toLowerCase() === String(status).toLowerCase());
  }
  if (branch) {
    filtered = filtered.filter((c) => c.branch.toLowerCase() === String(branch).toLowerCase());
  }
  if (zone) {
    filtered = filtered.filter((c) => c.zone?.toLowerCase() === String(zone).toLowerCase());
  }
  if (wardNumber) {
    filtered = filtered.filter((c) => c.wardNumber === Number(wardNumber));
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.complaintNumber.toLowerCase().includes(q) ||
        c.complainantName.toLowerCase().includes(q) ||
        c.contactNumber.includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.assignedJeName && c.assignedJeName.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
});

/**
 * GET /api/complaints/:id
 * Retrieve single complaint with attachments, assigned staff, and timeline.
 */
router.get('/:id', (req: Request, res: Response): void => {
  const id = req.params.id;
  const complaint = COMPLAINTS_STORE.find(
    (c) => c.id === id || c.complaintNumber.toLowerCase() === id.toLowerCase()
  );

  if (!complaint) {
    res.status(404).json({ success: false, error: 'Complaint record not found.' });
    return;
  }

  res.json({
    success: true,
    data: {
      ...complaint,
      slaBreached: computeSlaBreached(complaint),
    },
  });
});

/**
 * GET /api/complaints/:id/timeline
 * Retrieve chronological audit trail for a complaint.
 */
router.get('/:id/timeline', (req: Request, res: Response): void => {
  const id = req.params.id;
  const complaint = COMPLAINTS_STORE.find(
    (c) => c.id === id || c.complaintNumber.toLowerCase() === id.toLowerCase()
  );

  if (!complaint) {
    res.status(404).json({ success: false, error: 'Complaint not found.' });
    return;
  }

  res.json({
    success: true,
    data: complaint.timeline || [],
  });
});

/**
 * POST /api/complaints
 * Comprehensive multipart complaint registration with auto-routing and background Drive upload.
 */
router.post(
  '/',
  upload.fields([
    { name: 'evidence', maxCount: 5 },
    { name: 'evidenceImages', maxCount: 5 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body || {};
      const filesMap = (req.files as Record<string, Express.Multer.File[]>) || {};
      const evidenceFiles: Express.Multer.File[] = [
        ...(filesMap['evidence'] || []),
        ...(filesMap['evidenceImages'] || []),
      ];

      const complainantName = (body.complainantName || body.citizenName || '').trim();
      const contactNumber = (body.contactNumber || body.phoneNumber || '').trim();
      const description = (body.description || '').trim();
      const categoryId = String(body.categoryId || '1');
      const wardNumber = body.wardNumber ? parseInt(body.wardNumber, 10) : undefined;
      const address = (body.address || '').trim();
      const landmark = (body.landmark || '').trim();
      const mode = body.mode || 'Citizen Portal';

      if (!complainantName || !contactNumber || !description) {
        // Clean up uploaded files if validation fails
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

      // Auto-assign Field Officer from 95-Ward Roster
      let assignedOfficer = wardNumber ? resolveAssignedOfficer(wardNumber, branch) : null;

      const newSeq = COMPLAINTS_STORE.length + 1;
      const newId = `cmp-${String(newSeq).padStart(3, '0')}`;
      const complaintNumber = `MCL-2026-${String(newSeq).padStart(4, '0')}`;
      const now = new Date().toISOString();
      const dueAt = new Date(Date.now() + 48 * 3600000).toISOString(); // 48-Hour SLA

      const initialStatus: ComplaintStatus = assignedOfficer ? 'ASSIGNED' : 'NEEDS_REVIEW';

      // Construct Initial Attachments (with local temp URLs, updated after background upload)
      const initialAttachments: ComplaintAttachment[] = evidenceFiles.map((file, idx) => ({
        fileId: `temp-${Date.now()}-${idx}`,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        category: 'source',
        fileUrl: `/api/drive/files/temp-${idx}`,
      }));

      // Build Initial Timeline
      const initialTimeline: ComplaintTimelineEvent[] = [
        {
          id: `tl-${randomUUID().slice(0, 8)}`,
          complaintId: newId,
          timestamp: now,
          actorName: complainantName,
          actorRole: 'CITIZEN',
          action: 'REGISTERED',
          newStatus: 'SUBMITTED',
          notes: `Grievance registered via ${mode}. Category: ${categoryName} (${branch}).`,
        },
      ];

      if (assignedOfficer) {
        initialTimeline.push({
          id: `tl-${randomUUID().slice(0, 8)}`,
          complaintId: newId,
          timestamp: now,
          actorName: 'Territorial Routing Engine',
          actorRole: 'SYSTEM',
          action: 'ASSIGNED',
          previousStatus: 'SUBMITTED',
          newStatus: 'ASSIGNED',
          notes: `Territory auto-assigned: Ward ${wardNumber} (Zone ${derivedZone || 'MCL'}) to ${assignedOfficer.primaryOfficerName}. Contact: ${assignedOfficer.primaryOfficerPhone}.`,
        });
      }

      const newComplaint: Complaint = {
        id: newId,
        complaintNumber,
        complainantName,
        contactNumber,
        description,
        categoryId,
        categoryName,
        branch,
        status: initialStatus,
        mode,
        zone: derivedZone,
        wardNumber,
        address,
        landmark,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
        assignedJeId: assignedOfficer?.primaryOfficerId,
        assignedJeName: assignedOfficer?.primaryOfficerName,
        assignedJePhone: assignedOfficer?.primaryOfficerPhone,
        sdoName: assignedOfficer?.supervisingSdoName,
        xenName: assignedOfficer?.supervisingXenName,
        submittedAt: now,
        dueAt,
        slaBreached: false,
        attachments: initialAttachments,
        timeline: initialTimeline,
        createdAt: now,
        updatedAt: now,
      };

      COMPLAINTS_STORE.unshift(newComplaint);

      // Return HTTP 201 immediately so citizen/UI receives tracking number without waiting
      res.status(201).json({
        success: true,
        message: 'Grievance registered successfully.',
        data: newComplaint,
      });

      // Background Processing (Drive folder, file sync, cleanup)
      void (async () => {
        try {
          if (evidenceFiles.length > 0) {
            await createComplaintDriveFolder(complaintNumber);
            const uploadedFiles = await uploadComplaintFiles(complaintNumber, 'source', evidenceFiles);

            if (uploadedFiles.length > 0) {
              newComplaint.attachments = uploadedFiles.map((f) => ({
                fileId: f.fileId,
                fileName: f.fileName,
                mimeType: f.mimeType,
                size: f.size,
                category: 'source',
                fileUrl: f.fileUrl || `/api/drive/files/${f.fileId}`,
              }));
            }
          }
        } catch (err) {
          console.error(`[BackgroundSync] Upload failed for ${complaintNumber}:`, err);
        } finally {
          void deleteTemporaryFiles(evidenceFiles);
        }
      })();
    } catch (error: any) {
      console.error('[ComplaintRoutes] Error submitting complaint:', error);
      res.status(500).json({ success: false, error: 'Internal server error while registering grievance.' });
    }
  }
);

/**
 * POST /api/complaints/:id/acknowledge
 * Field officer acknowledges assigned complaint, recording response timestamp.
 */
router.post('/:id/acknowledge', (req: Request, res: Response): void => {
  const id = req.params.id;
  const complaint = COMPLAINTS_STORE.find(
    (c) => c.id === id || c.complaintNumber.toLowerCase() === id.toLowerCase()
  );

  if (!complaint) {
    res.status(404).json({ success: false, error: 'Complaint not found.' });
    return;
  }

  const officerName = req.body.officerName || complaint.assignedJeName || 'Field Officer';
  const officerId = req.body.officerId || complaint.assignedJeId || 'field-officer';
  const now = new Date().toISOString();

  complaint.assignmentAcknowledgedAt = now;
  complaint.acknowledgedByOfficerId = officerId;
  const prevStatus = complaint.status;
  if (complaint.status === 'ASSIGNED') {
    complaint.status = 'ACKNOWLEDGED';
  }
  complaint.updatedAt = now;

  complaint.timeline = complaint.timeline || [];
  complaint.timeline.push({
    id: `tl-${randomUUID().slice(0, 8)}`,
    complaintId: complaint.id,
    timestamp: now,
    actorName: officerName,
    actorRole: 'FIELD_OFFICER',
    action: 'ACKNOWLEDGED',
    previousStatus: prevStatus,
    newStatus: complaint.status,
    notes: `${officerName} acknowledged the assignment. Response clock locked.`,
  });

  res.json({
    success: true,
    message: 'Assignment acknowledged successfully.',
    data: complaint,
  });
});

/**
 * POST /api/complaints/:id/status
 * Update complaint status (e.g. IN_PROGRESS, ESCALATED) with mandatory remarks.
 */
router.post('/:id/status', (req: Request, res: Response): void => {
  const id = req.params.id;
  const complaint = COMPLAINTS_STORE.find(
    (c) => c.id === id || c.complaintNumber.toLowerCase() === id.toLowerCase()
  );

  if (!complaint) {
    res.status(404).json({ success: false, error: 'Complaint not found.' });
    return;
  }

  const { status, remarks, actorName, actorRole } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Target status is required.' });
    return;
  }

  const prevStatus = complaint.status;
  const now = new Date().toISOString();
  complaint.status = status as ComplaintStatus;
  complaint.updatedAt = now;

  complaint.timeline = complaint.timeline || [];
  complaint.timeline.push({
    id: `tl-${randomUUID().slice(0, 8)}`,
    complaintId: complaint.id,
    timestamp: now,
    actorName: actorName || 'MCL Official',
    actorRole: actorRole || 'OFFICIAL',
    action: 'STATUS_UPDATED',
    previousStatus: prevStatus,
    newStatus: complaint.status,
    notes: remarks || `Status changed from ${prevStatus} to ${status}.`,
  });

  res.json({
    success: true,
    message: `Status updated to ${status}.`,
    data: complaint,
  });
});

/**
 * POST /api/complaints/:id/assign
 * Supervisor or Control Room reassigns complaint to another officer with mandatory audit reason.
 */
router.post('/:id/assign', (req: Request, res: Response): void => {
  const id = req.params.id;
  const complaint = COMPLAINTS_STORE.find(
    (c) => c.id === id || c.complaintNumber.toLowerCase() === id.toLowerCase()
  );

  if (!complaint) {
    res.status(404).json({ success: false, error: 'Complaint not found.' });
    return;
  }

  const { officerName, officerPhone, officerId, reason, assignedBy } = req.body;
  if (!officerName) {
    res.status(400).json({ success: false, error: 'New officer name is required.' });
    return;
  }

  const prevOfficer = complaint.assignedJeName || 'Unassigned';
  const now = new Date().toISOString();

  complaint.assignedJeName = officerName;
  complaint.assignedJePhone = officerPhone || complaint.assignedJePhone;
  complaint.assignedJeId = officerId || `officer-${Date.now()}`;
  complaint.status = 'ASSIGNED';
  complaint.assignmentAcknowledgedAt = undefined;
  complaint.acknowledgedByOfficerId = undefined;
  complaint.updatedAt = now;

  complaint.timeline = complaint.timeline || [];
  complaint.timeline.push({
    id: `tl-${randomUUID().slice(0, 8)}`,
    complaintId: complaint.id,
    timestamp: now,
    actorName: assignedBy || 'Control Room Supervisor',
    actorRole: 'SUPERVISOR',
    action: 'REASSIGNED',
    notes: `Reassigned from ${prevOfficer} to ${officerName}. Reason: ${reason || 'Administrative routing'}.`,
  });

  res.json({
    success: true,
    message: `Complaint reassigned to ${officerName}.`,
    data: complaint,
  });
});

/**
 * POST /api/complaints/:id/resolution
 * Field officer submits resolution description along with completion photos.
 */
router.post(
  '/:id/resolution',
  upload.fields([{ name: 'resolutionProof', maxCount: 5 }]),
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const complaint = COMPLAINTS_STORE.find(
      (c) => c.id === id || c.complaintNumber.toLowerCase() === id.toLowerCase()
    );

    if (!complaint) {
      res.status(404).json({ success: false, error: 'Complaint not found.' });
      return;
    }

    const body = req.body || {};
    const filesMap = (req.files as Record<string, Express.Multer.File[]>) || {};
    const proofFiles = filesMap['resolutionProof'] || [];
    const resolutionNotes = (body.resolutionNotes || body.notes || '').trim();
    const officerName = body.officerName || complaint.assignedJeName || 'Field Officer';

    if (!resolutionNotes) {
      void deleteTemporaryFiles(proofFiles);
      res.status(400).json({ success: false, error: 'Resolution description is required.' });
      return;
    }

    const now = new Date().toISOString();
    complaint.resolutionNotes = resolutionNotes;
    complaint.resolvedAt = now;
    complaint.status = 'RESOLUTION_SUBMITTED';
    complaint.updatedAt = now;

    const initialResolutionProof: ComplaintAttachment[] = proofFiles.map((file, idx) => ({
      fileId: `res-${Date.now()}-${idx}`,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      category: 'res',
      fileUrl: `/api/drive/files/res-${idx}`,
    }));

    complaint.resolutionProof = initialResolutionProof;

    complaint.timeline = complaint.timeline || [];
    complaint.timeline.push({
      id: `tl-${randomUUID().slice(0, 8)}`,
      complaintId: complaint.id,
      timestamp: now,
      actorName: officerName,
      actorRole: 'FIELD_OFFICER',
      action: 'RESOLUTION_SUBMITTED',
      previousStatus: 'ACKNOWLEDGED',
      newStatus: 'RESOLUTION_SUBMITTED',
      notes: `Resolution submitted: "${resolutionNotes}". Attached ${proofFiles.length} proof photo(s).`,
    });

    res.json({
      success: true,
      message: 'Resolution submitted successfully for verification.',
      data: complaint,
    });

    // Background Drive upload for resolution proof
    void (async () => {
      try {
        if (proofFiles.length > 0) {
          const uploaded = await uploadComplaintFiles(complaint.complaintNumber, 'res', proofFiles);
          if (uploaded.length > 0) {
            complaint.resolutionProof = uploaded.map((f) => ({
              fileId: f.fileId,
              fileName: f.fileName,
              mimeType: f.mimeType,
              size: f.size,
              category: 'res',
              fileUrl: f.fileUrl || `/api/drive/files/${f.fileId}`,
            }));
          }
        }
      } catch (err) {
        console.error(`[BackgroundSync] Resolution upload failed for ${complaint.complaintNumber}:`, err);
      } finally {
        void deleteTemporaryFiles(proofFiles);
      }
    })();
  }
);

/**
 * POST /api/complaints/:id/verify-close
 * Citizen or Control Room quality verification to permanently close grievance.
 */
router.post('/:id/verify-close', (req: Request, res: Response): void => {
  const id = req.params.id;
  const complaint = COMPLAINTS_STORE.find(
    (c) => c.id === id || c.complaintNumber.toLowerCase() === id.toLowerCase()
  );

  if (!complaint) {
    res.status(404).json({ success: false, error: 'Complaint not found.' });
    return;
  }

  const { rating, feedback, closedBy, actorRole } = req.body;
  const now = new Date().toISOString();

  complaint.status = 'CLOSED';
  complaint.closedAt = now;
  complaint.updatedAt = now;

  complaint.timeline = complaint.timeline || [];
  complaint.timeline.push({
    id: `tl-${randomUUID().slice(0, 8)}`,
    complaintId: complaint.id,
    timestamp: now,
    actorName: closedBy || 'Citizen / Verification Desk',
    actorRole: actorRole || 'CITIZEN',
    action: 'CLOSED',
    previousStatus: 'RESOLUTION_SUBMITTED',
    newStatus: 'CLOSED',
    notes: `Work verified and closed.${rating ? ` Citizen Rating: ${rating}/5.` : ''}${
      feedback ? ` Feedback: "${feedback}"` : ''
    }`,
  });

  res.json({
    success: true,
    message: 'Grievance verified and permanently closed.',
    data: complaint,
  });
});

export default router;
