-- Migration 007: Atomic Sequence, Verified Phone State, OTPs & Persistent Rate Limiting

-- 1. Add phone verification status to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE;

-- Mark all official seeded municipal staff (whose official roster phones are pre-verified) as verified
UPDATE users SET is_phone_verified = TRUE WHERE role IN ('admin', 'operator', 'zc', 'jc', 'sdo', 'xen', 'se', 'je');

-- 2. OTP storage table for phone ownership verification
CREATE TABLE IF NOT EXISTS phone_verification_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phone_otps_lookup ON phone_verification_otps(phone_number, is_used, expires_at);

-- 3. Atomic complaint sequence for collision-free numbering
CREATE SEQUENCE IF NOT EXISTS complaint_number_seq;

-- Synchronize sequence with current complaint count
DO $$
DECLARE
    current_max INT;
BEGIN
    SELECT COALESCE(COUNT(*), 0) INTO current_max FROM complaints;
    PERFORM setval('complaint_number_seq', GREATEST(current_max, 1), true);
END $$;

-- 4. Persistent rate limiting ledger for multi-instance / restart resilience
CREATE TABLE IF NOT EXISTS rate_limit_entries (
    key VARCHAR(120) PRIMARY KEY,
    hits INT DEFAULT 1,
    reset_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_reset ON rate_limit_entries(reset_at);
