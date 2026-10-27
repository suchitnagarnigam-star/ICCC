-- Migration 006: Media Schema Hardening and Unclaimed Grievance Support
-- Adds drive_file_id, file_name, file_size_bytes to complaint_media
-- Adds is_unclaimed flag to complaints table for anonymous citizen portal intakes

ALTER TABLE complaint_media ADD COLUMN IF NOT EXISTS drive_file_id VARCHAR(255);
ALTER TABLE complaint_media ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE complaint_media ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;

CREATE INDEX IF NOT EXISTS idx_complaint_media_storage_key ON complaint_media(storage_key);
CREATE INDEX IF NOT EXISTS idx_complaint_media_drive_id ON complaint_media(drive_file_id);

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_unclaimed BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_complaints_unclaimed_contact ON complaints(contact_number) WHERE is_unclaimed = TRUE;
