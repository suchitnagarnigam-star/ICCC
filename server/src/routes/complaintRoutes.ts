import { Router, Request, Response } from 'express';
import { Complaint, CreateComplaintInput } from '../types/complaint';
import { INITIAL_COMPLAINT_CATEGORIES } from './referenceRoutes';

const router = Router();

// In-memory complaint storage for local bootstrapping
const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-001',
    complaintNumber: 'MCL-2026-0001',
    complainantName: 'Amarjeet Singh',
    contactNumber: '8146599777',
    description: 'Road potholes near Bhai Ranjeet Singh Nagar DAV School',
    categoryId: '6',
    categoryName: 'Potholes',
    branch: 'B&R',
    status: 'ASSIGNED',
    mode: '24/7 Hotline',
    zone: 'D',
    wardNumber: 64,
    address: '16B Bhai Ranjeet Singh Nagar',
    landmark: 'Near DAV School',
    assignedJeId: 'usr-je-01',
    assignedJeName: 'Ankush Sharma (JE B&R)',
    assignedJePhone: '7986605351',
    submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    dueAt: new Date(Date.now() + 3600000 * 36).toISOString(),
    slaBreached: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cmp-002',
    complaintNumber: 'MCL-2026-0002',
    complainantName: 'Ashwin Kumar',
    contactNumber: '9988150511',
    description: 'Sewerage overflow in street during rainy season',
    categoryId: '12',
    categoryName: 'Sewerage/Road Jalis Overchock.',
    branch: 'O&M',
    status: 'RESOLUTION_SUBMITTED',
    mode: 'WhatsApp Helpline',
    zone: 'B',
    wardNumber: 7,
    address: 'Jain nagar, Rahon road',
    landmark: 'Near Dhawan Hospital',
    assignedJeId: 'usr-je-02',
    assignedJeName: 'Sh. Ramandeep Singh (JE O&M)',
    assignedJePhone: '9855523213',
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    dueAt: new Date(Date.now() + 3600000 * 24).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    slaBreached: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

router.get('/', (req: Request, res: Response) => {
  const { status, branch, wardNumber } = req.query;
  let filtered = [...MOCK_COMPLAINTS];

  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (branch) {
    filtered = filtered.filter((c) => c.branch === branch);
  }
  if (wardNumber) {
    filtered = filtered.filter((c) => c.wardNumber === Number(wardNumber));
  }

  res.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
});

router.get('/:id', (req: Request, res: Response): void => {
  const complaint = MOCK_COMPLAINTS.find((c) => c.id === req.params.id || c.complaintNumber === req.params.id);
  if (!complaint) {
    res.status(404).json({ success: false, error: 'Complaint not found.' });
    return;
  }
  res.json({
    success: true,
    data: complaint,
  });
});

router.post('/', (req: Request, res: Response): void => {
  const input = req.body as CreateComplaintInput;

  if (!input.complainantName || !input.contactNumber || !input.description || !input.categoryId) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: complainantName, contactNumber, description, categoryId',
    });
    return;
  }

  const category = INITIAL_COMPLAINT_CATEGORIES.find((cat) => cat.id === input.categoryId);
  const branch = (category ? category.branch : 'O&M') as import('../types/complaint').DepartmentBranch;
  const categoryName = category ? category.name : 'General Grievance';

  const newId = `cmp-${String(MOCK_COMPLAINTS.length + 1).padStart(3, '0')}`;
  const complaintNumber = `MCL-2026-${String(MOCK_COMPLAINTS.length + 1).padStart(4, '0')}`;
  const now = new Date().toISOString();
  // 48 working hours approximation
  const dueAt = new Date(Date.now() + 48 * 3600000).toISOString();

  const newComplaint: Complaint = {
    id: newId,
    complaintNumber,
    complainantName: input.complainantName,
    contactNumber: input.contactNumber,
    description: input.description,
    categoryId: input.categoryId,
    categoryName,
    branch,
    status: input.wardNumber ? 'ASSIGNED' : 'NEEDS_REVIEW',
    mode: input.mode || 'Citizen Portal',
    wardNumber: input.wardNumber,
    zone: input.zone,
    address: input.address,
    landmark: input.landmark,
    latitude: input.latitude,
    longitude: input.longitude,
    submittedAt: now,
    dueAt,
    slaBreached: false,
    createdAt: now,
    updatedAt: now,
  };

  MOCK_COMPLAINTS.unshift(newComplaint);

  res.status(201).json({
    success: true,
    message: 'Complaint successfully registered.',
    data: newComplaint,
  });
});

export default router;
