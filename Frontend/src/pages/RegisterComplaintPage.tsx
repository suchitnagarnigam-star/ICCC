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

  // Auto-redirect timer reference
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

  // Countdown timer on successful registration
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

  const handleFiles = (incomingFiles: FileList | null) => {
    if (!incomingFiles) return;
    const valid: UploadedFilePreview[] = [];

    Array.from(incomingFiles).forEach((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
        alert(`File format ${file.type} is not supported. Please upload JPEG, PNG, or PDF.`);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 15MB size limit.`);
        return;
      }

      valid.push({
        file,
        name: file.name,
        size: file.size,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      });
    });

    setEvidenceFiles((prev) => [...prev, ...valid].slice(0, 5));
  };

  const removeFile = (idx: number) => {
    setEvidenceFiles((prev) => {
      const copy = [...prev];
      if (copy[idx]?.previewUrl) URL.revokeObjectURL(copy[idx].previewUrl);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('complainantName', name);
      formData.append('contactNumber', phone);
      formData.append('categoryId', categoryId);
      formData.append('description', description);
      if (wardNumber) formData.append('wardNumber', wardNumber);
      if (zone) formData.append('zone', zone);
      if (address) formData.append('address', address);
      if (landmark) formData.append('landmark', landmark);
      formData.append('mode', 'Citizen Portal');

      // Append multi-part evidence attachments
      evidenceFiles.forEach((item) => {
        formData.append('evidence', item.file);
      });

      const token = localStorage.getItem('mcl_iccc_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSubmittedComplaint(json.data);
      } else {
        throw new Error(json.error || 'Failed to submit grievance.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedComplaint) {
    return (
      <div className="civic-card" style={{ maxWidth: '680px', margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>✅</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)', marginBottom: '0.5rem' }}>
          Grievance Successfully Registered
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Your complaint has been logged in the Municipal Corporation Ludhiana ICCC system with a 48-hour SLA target.
        </p>

        <div style={{ background: 'var(--color-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'left', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Tracking Number:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontSize: '1.15rem' }}>
              {submittedComplaint.complaintNumber}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Branch &amp; Category:</span>
            <strong>{submittedComplaint.categoryName} ({submittedComplaint.branch})</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Initial Status:</span>
            <StatusBadge status={submittedComplaint.status} size="sm" />
          </div>
          {submittedComplaint.assignedJeName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Territorial Field JE:</span>
              <strong style={{ color: 'var(--color-primary)' }}>{submittedComplaint.assignedJeName}</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Target Resolution:</span>
            <strong style={{ color: 'var(--color-accent)' }}>48 Working Hours ({new Date(submittedComplaint.dueAt).toLocaleDateString()})</strong>
          </div>
        </div>

        {onViewComplaint && (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Automatically redirecting to complaint dossier in <strong>{countdown}s</strong>...
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {onViewComplaint && (
            <button
              className="btn-primary"
              onClick={() => onViewComplaint(submittedComplaint.id)}
              style={{ padding: '0.65rem 1.5rem' }}
            >
              View Full Dossier Now →
            </button>
          )}
          <button
            className="btn-secondary"
            onClick={() => {
              setSubmittedComplaint(null);
              setName('');
              setPhone('');
              setDescription('');
              setEvidenceFiles([]);
            }}
          >
            Register Another Grievance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="civic-header">
        <h1 className="civic-title">Register Civic Grievance</h1>
        <p className="civic-desc">
          Lodge complaints regarding municipal infrastructure (water, roads, street lights, sanitation). Direct SLA tracking to field engineers.
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #f87171', fontSize: '0.9rem' }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="civic-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Section 1: Grievance Classification */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
            1. Grievance Category &amp; Responsible Branch
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Select Issue Category *</label>
              <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.jointLabel || `${c.name} - ${c.branch}`}
                  </option>
                ))}
              </select>
              {selectedCat && (
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Managed by: <strong style={{ color: 'var(--color-primary)' }}>{selectedCat.branch} Branch</strong> (Target SLA: 48 Hours)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Complainant Details */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
            2. Citizen / Complainant Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Amarjeet Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Contact Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Geographic Territory */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
            3. Location &amp; Territorial Jurisdiction
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">MCL Ward Number (1 to 95) *</label>
              <input
                type="number"
                min="1"
                max="95"
                className="form-input"
                placeholder="e.g. 64"
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Municipal Zone</label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-derived from ward (A, B, C, D)"
                value={zone ? `Zone ${zone}` : ''}
                readOnly
                style={{ backgroundColor: 'var(--color-bg)', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Street Address / Mohalla *</label>
              <input
                type="text"
                className="form-input"
                placeholder="House / Street / Colony name"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Prominent Landmark</label>
              <input
                type="text"
                className="form-input"
                placeholder="Near hospital, temple, school, etc."
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Grievance Description */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
            4. Grievance Details &amp; Observations
          </h3>
          <div>
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-textarea"
              placeholder="Provide specific details about the issue (e.g. location of burst, size of pothole, duration of overflow)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>

        {/* Section 5: Photo Evidence Drag & Drop Upload */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
            5. Photographic Evidence (Optional, max 5 files)
          </h3>

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
            style={{
              border: `2px dashed ${isDragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: '8px',
              padding: '1.75rem',
              textAlign: 'center',
              backgroundColor: isDragOver ? '#f0f9ff' : 'var(--color-bg)',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
              Click to select photos or drag and drop files here
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Supports JPG, PNG, WEBP, PDF up to 15MB each
            </div>
          </div>

          {/* Uploaded Files Previews */}
          {evidenceFiles.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {evidenceFiles.map((f, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#ffffff',
                    fontSize: '0.8rem',
                  }}
                >
                  {f.previewUrl ? (
                    <img src={f.previewUrl} alt="preview" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <span>📄</span>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>{formatBytes(f.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      fontWeight: 700,
                      marginLeft: '4px',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Registering Grievance...' : 'Submit Civic Grievance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterComplaintPage;
