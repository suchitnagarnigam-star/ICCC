-- Migration 005: Widen Complaint Mode and Zone Code for Historical Data
ALTER TABLE complaints ALTER COLUMN mode TYPE TEXT;
ALTER TABLE complaints ALTER COLUMN zone_code TYPE VARCHAR(50);
