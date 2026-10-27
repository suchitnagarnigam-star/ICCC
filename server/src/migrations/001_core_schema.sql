-- MCL ICCC Smart Municipal Complaint Management System
-- Migration 001: Core Relational Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments & Branches
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Zones & Wards
CREATE TABLE IF NOT EXISTS municipal_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL, -- 'A', 'B', 'C', 'D'
    name VARCHAR(100) NOT NULL,
    commissioner_name VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS municipal_wards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ward_number INT UNIQUE NOT NULL, -- 1 through 95
    zone_code VARCHAR(10) REFERENCES municipal_zones(code),
    councillor_name VARCHAR(150),
    constituency VARCHAR(100),
    mla_name VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users & Staff Profiles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150),
    role VARCHAR(30) NOT NULL, -- 'citizen', 'je', 'operator', 'sdo', 'xen', 'se', 'zc', 'jc', 'admin'
    designation VARCHAR(100),
    employee_code VARCHAR(50),
    pin_hash VARCHAR(255) NOT NULL,
    zone_code VARCHAR(10),
    ward_number INT,
    branch VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Complaint Categories
CREATE TABLE IF NOT EXISTS complaint_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    branch VARCHAR(30) NOT NULL, -- 'O&M', 'B&R', 'Health', 'Light'
    joint_label VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Staff Area Assignments (Roster)
CREATE TABLE IF NOT EXISTS staff_area_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    branch VARCHAR(30) NOT NULL,
    ward_number INT REFERENCES municipal_wards(ward_number),
    zone_code VARCHAR(10) REFERENCES municipal_zones(code),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Central Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_number VARCHAR(50) UNIQUE NOT NULL,
    source_system VARCHAR(50) DEFAULT 'ICCC',
    source_id VARCHAR(100),
    citizen_id UUID REFERENCES users(id),
    complainant_name VARCHAR(150) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES complaint_categories(id),
    branch VARCHAR(30) NOT NULL,
    current_status VARCHAR(40) NOT NULL DEFAULT 'SUBMITTED',
    mode VARCHAR(40) DEFAULT 'Citizen Portal',
    zone_code VARCHAR(10),
    ward_number INT,
    address TEXT,
    landmark TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    assigned_je_id UUID REFERENCES users(id),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    sla_breached BOOLEAN DEFAULT FALSE,
    sla_policy_version VARCHAR(20) DEFAULT 'v1.0',
    is_paused BOOLEAN DEFAULT FALSE,
    paused_at TIMESTAMPTZ,
    pause_reason TEXT,
    total_paused_minutes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(current_status);
CREATE INDEX IF NOT EXISTS idx_complaints_ward ON complaints(ward_number);
CREATE INDEX IF NOT EXISTS idx_complaints_branch ON complaints(branch);
CREATE INDEX IF NOT EXISTS idx_complaints_je ON complaints(assigned_je_id);
CREATE INDEX IF NOT EXISTS idx_complaints_due_at ON complaints(due_at);

-- 7. Immutable Complaint Status History
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    previous_status VARCHAR(40),
    new_status VARCHAR(40) NOT NULL,
    actor_user_id UUID REFERENCES users(id),
    action_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Complaint Assignments History
CREATE TABLE IF NOT EXISTS complaint_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    assigned_to_user_id UUID REFERENCES users(id),
    assigned_by_user_id UUID REFERENCES users(id),
    assignment_reason TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    is_current BOOLEAN DEFAULT TRUE
);

-- 9. Complaint Media Evidence
CREATE TABLE IF NOT EXISTS complaint_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    storage_key VARCHAR(255) NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    purpose VARCHAR(30) NOT NULL, -- 'intake', 'progress', 'resolution', 'dispute'
    uploaded_by_user_id UUID REFERENCES users(id),
    device_lat DOUBLE PRECISION,
    device_lng DOUBLE PRECISION,
    accuracy_meters DOUBLE PRECISION,
    location_status VARCHAR(30),
    upload_state VARCHAR(20) DEFAULT 'pending', -- 'pending', 'uploaded', 'failed'
    error_message TEXT,
    retry_count INT DEFAULT 0,
    sha256_checksum VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Verification Audits
CREATE TABLE IF NOT EXISTS complaint_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    verifier_user_id UUID REFERENCES users(id),
    verifier_role VARCHAR(30) NOT NULL, -- 'citizen' or 'officer'
    result VARCHAR(20) NOT NULL, -- 'accepted' or 'disputed'
    dispute_comments TEXT,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Shift Handover Records
CREATE TABLE IF NOT EXISTS shift_handover_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outgoing_operator_id UUID REFERENCES users(id) NOT NULL,
    incoming_operator_id UUID REFERENCES users(id),
    shift_started_at TIMESTAMPTZ NOT NULL,
    shift_ended_at TIMESTAMPTZ NOT NULL,
    pending_cases_count INT DEFAULT 0,
    overdue_cases_count INT DEFAULT 0,
    handover_notes TEXT,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Transactional Notification Outbox & Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    recipient_user_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'push',
    payload_json JSONB NOT NULL,
    delivery_state VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    attempt_count INT DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- 13. System Security & Operational Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    diff_json JSONB,
    actor_ip VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

