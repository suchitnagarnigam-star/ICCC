import React, { useState, useEffect } from 'react';
import { ComplaintCategory, Complaint } from '../types';
import { apiFetch } from '../shared/utils/apiConfig';

export const RegisterComplaintPage: React.FC = () => {
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiFetch('/reference/categories');
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setCategoryId(res.data[0].id);
          }
        }
      } catch (err: any) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await apiFetch('/complaints', {
        method: 'POST',
        body: JSON.stringify({
          complainantName: name,
          contactNumber: phone,
          categoryId,
          description,
          wardNumber: wardNumber ? parseInt(wardNumber, 10) : undefined,
          address,
          landmark,
          mode: 'Citizen Portal',
        }),
      });

      if (res.success && res.data) {
        setSubmittedComplaint(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedComplaint) {
    return (
      <div className="civic-card" style={{ maxWidth: '650px', margin: '2rem auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-success)', marginBottom: '0.5rem' }}>
          Grievance Successfully Registered
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Your complaint has been logged in the MCL ICCC database. Please retain your reference number for tracking.
        </p>

        <div style={{ background: 'var(--color-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Tracking Number:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>{submittedComplaint.complaintNumber}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Category / Branch:</span>
            <strong>{submittedComplaint.categoryName} ({submittedComplaint.branch})</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Current Status:</span>
            <span className={`status-badge status-${submittedComplaint.status}`}>{submittedComplaint.status}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Service Target (48h):</span>
            <strong style={{ color: 'var(--color-accent)' }}>{new Date(submittedComplaint.dueAt).toLocaleDateString()}</strong>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setSubmittedComplaint(null)}>
          Register Another Grievance
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="civic-header">
        <h1 className="civic-title">Register a Civic Complaint</h1>
        <p className="civic-desc">
          Official grievance intake for roads, sanitation, water supply, sewage, tree fall, and streetlights in Ludhiana.
        </p>
      </div>

      <div className="civic-card">
        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
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
            <div className="form-group">
              <label className="form-label">Contact Number *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Grievance Category *</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.jointLabel || `${cat.name} - ${cat.branch}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Complaint Details *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe the problem, severity, and exact location specifics..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Ward Number (Optional)</label>
              <input
                type="number"
                min="1"
                max="95"
                className="form-input"
                placeholder="1 - 95"
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Landmark / Mohalla</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Near DAV School / Main Chowk"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address / Locality</label>
            <input
              type="text"
              className="form-input"
              placeholder="Street name, colony, or area"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Submit Grievance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

