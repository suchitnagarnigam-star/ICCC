import React, { useState, useEffect, useRef } from 'react';
import { ComplaintCategory, Complaint } from '../types';
import { API_BASE_URL } from '../shared/utils/apiConfig';
import StatusBadge from '../components/StatusBadge';

interface UploadedFilePreview {
  file: File;
  name: string;
  size: number;
  previewUrl: string;
}

interface RegisterComplaintPageProps {
  onViewComplaint?: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const RegisterComplaintPage: React.FC<RegisterComplaintPageProps> = ({
  onViewComplaint,
}) => {
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [zone, setZone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<UploadedFilePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_BASE_URL}/reference/categories`);
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setCategoryId(json.data[0].id);
          }
        }
      } catch (err: any) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  // Auto derive zone when wardNumber changes
  useEffect(() => {
    if (!wardNumber) {
      setZone('');
      return;
    }
    const num = parseInt(wardNumber, 10);
    if (isNaN(num)) return;

    if (num >= 1 && num <= 24) setZone('A');
    else if (num >= 25 && num <= 48) setZone('B');
    else if (num >= 49 && num <= 72) setZone('C');
    else if (num >= 73 && num <= 95) setZone('D');
  }, [wardNumber]);

  // Auto-redirect timer on success
  useEffect(() => {
    if (submittedComplaint && onViewComplaint) {
      setCountdown(5);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            onViewComplaint(submittedComplaint.id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [submittedComplaint, onViewComplaint]);

  const selectedCat = categories.find((c) => c.id === categoryId);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles: UploadedFilePreview[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newFiles.push({
          file,
          name: file.name,
          size: file.size,
          previewUrl: URL.createObjectURL(file),
        });
      }
    });
    setEvidenceFiles((prev) => [...prev, ...newFiles].slice(0, 3));
  };

  const handleRemoveFile = (index: number) => {
    setEvidenceFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length !== 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!categoryId) {
      setError('Please select a valid grievance category.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('complainantName', name || 'Concerned Citizen');
      formData.append('contactNumber', phone);
      formData.append('categoryId', categoryId);
      formData.append('description', description);
      if (wardNumber) formData.append('wardNumber', wardNumber);
      if (zone) formData.append('zone', zone);
      if (address) formData.append('address', address);
      if (landmark) formData.append('landmark', landmark);
      formData.append('mode', 'WEB');

      evidenceFiles.forEach((ef) => {
        formData.append('evidence', ef.file);
      });

      const token = localStorage.getItem('mcl_iccc_token');
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await response.json();
      if (json.success && json.complaint) {
        setSubmittedComplaint(json.complaint);
      } else {
        setError(json.error || 'Failed to submit grievance. Please verify inputs.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (submittedComplaint) {
    return (
      <div className="max-w-xl mx-auto my-6 bg-white border border-border-divider rounded p-6 sm:p-8 shadow-stitch-sm space-y-5 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-[36px]">verified</span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-mono">
            GRIEVANCE RECORDED
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            Complaint Registered Successfully
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Assigned to Municipal Corporation Ludhiana field engineering division.
          </p>
        </div>

        <div className="p-4 bg-surface-low rounded border border-border-divider text-left space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-divider">
            <span className="text-slate-500 font-semibold">Tracking Number:</span>
            <span className="font-mono text-base font-bold text-primary tnum">
              {submittedComplaint.complaintNumber}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Status:</span>
            <StatusBadge status={submittedComplaint.status} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Department:</span>
            <span className="font-semibold text-slate-800">{submittedComplaint.branch}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Territory:</span>
            <span className="font-medium text-slate-800">
              Ward {submittedComplaint.wardNumber || '—'} (Zone {submittedComplaint.zone || '—'})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Statutory SLA Target:</span>
            <span className="font-mono font-bold text-slate-800 tnum">
              {new Date(submittedComplaint.dueAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          {onViewComplaint && (
            <button
              onClick={() => {
                if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                onViewComplaint(submittedComplaint.id);
              }}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-stitch-sm transition flex items-center justify-center gap-1.5"
            >
              <span>View Dossier Now ({countdown}s)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}

          <button
            onClick={() => {
              setSubmittedComplaint(null);
              setName('');
              setPhone('');
              setDescription('');
              setWardNumber('');
              setAddress('');
              setLandmark('');
              setEvidenceFiles([]);
            }}
            className="px-4 py-2.5 bg-surface-low hover:bg-surface-container text-slate-700 text-xs font-semibold rounded border border-border-divider transition"
          >
            File Another Grievance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white border border-border-divider rounded p-4 sm:p-5 shadow-stitch-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">
              PUBLIC INTAKE
            </span>
            <span className="text-xs text-slate-500 font-medium">Citizen Service Portal</span>
          </div>
          <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
            Register Public Civic Grievance
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Submit road defects, water contamination, sewer overflows, garbage dumps, or broken street lights for on-ground municipal rectification.
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-[10px] text-slate-400 block uppercase font-mono">Statutory Target</span>
          <span className="text-xs font-bold text-emerald-700">48 Working Hours</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-border-divider rounded p-5 sm:p-6 shadow-stitch-sm space-y-5">
        {/* Step 1: Complainant Information */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-border-divider mb-3">
            <span className="material-symbols-outlined text-[16px] text-primary">person</span>
            1. Citizen Identity &amp; Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Harpreet Singh"
                className="w-full text-xs bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                10-Digit Mobile Number *
              </label>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 9814012345"
                className="w-full text-xs font-mono font-bold bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Required for SMS status updates &amp; field officer dispatch verification.
              </span>
            </div>
          </div>
        </div>

        {/* Step 2: Grievance Category & Location */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-border-divider mb-3">
            <span className="material-symbols-outlined text-[16px] text-primary">category</span>
            2. Grievance Category &amp; Territory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Defect / Issue Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    [{cat.branch}] {cat.name} ({cat.jointLabel})
                  </option>
                ))}
              </select>
              {selectedCat && (
                <div className="mt-1 text-[11px] text-blue-700 font-medium">
                  Dispatches to: <strong>{selectedCat.branch} Branch</strong> ({selectedCat.jointLabel})
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Ludhiana Ward Number (1–95)
              </label>
              <input
                type="number"
                min={1}
                max={95}
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                placeholder="e.g. 14"
                className="w-full text-xs font-mono font-bold bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {zone && (
                <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
                  Automatically inferred: <strong>Zone {zone}</strong>
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Prominent Landmark *
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Gurdwara Sahib / Cheema Chowk"
                className="w-full text-xs bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Specific Street Address / Location Details
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Street #4, Model Town Extension, Ludhiana"
                className="w-full text-xs bg-surface-low border border-border-divider rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Grievance Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue clearly (e.g. sewer overflow since 2 days causing health hazard, deep pothole in front of gate)..."
                className="w-full text-xs bg-surface-low border border-border-divider rounded p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>
        </div>

        {/* Step 3: Photographic Evidence (Camera Supported) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-border-divider mb-3">
            <span className="material-symbols-outlined text-[16px] text-primary">photo_camera</span>
            3. Photographic Evidence (Upload or Snap)
          </h2>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded p-5 text-center cursor-pointer transition ${
              isDragOver
                ? 'border-primary bg-blue-50/50'
                : 'border-border-divider hover:border-primary hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <span className="material-symbols-outlined text-primary text-[32px] block mb-1">
              camera_alt
            </span>
            <span className="text-xs font-bold text-slate-800 block">
              Tap to Take Photo with Camera or Browse Files
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Supports JPG, PNG up to 10MB • Max 3 Photos
            </span>
          </div>

          {/* Evidence Previews */}
          {evidenceFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {evidenceFiles.map((f, idx) => (
                <div key={idx} className="relative rounded border border-border-divider overflow-hidden bg-slate-100 group">
                  <img src={f.previewUrl} alt={f.name} className="w-full h-24 object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center shadow"
                    title="Remove Photo"
                  >
                    ×
                  </button>
                  <div className="p-1 bg-black/60 text-white text-[9px] truncate font-mono">
                    {f.name} ({formatBytes(f.size)})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded shadow-stitch-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>{isSubmitting ? 'Submitting to Municipal Control Room...' : 'Submit Grievance to MCL'}</span>
          </button>
          <span className="text-[10px] text-slate-400 text-center block mt-2">
            By submitting, you certify that the defect report and photographs represent genuine civic issues within Ludhiana jurisdiction.
          </span>
        </div>
      </form>
    </div>
  );
};

export default RegisterComplaintPage;
