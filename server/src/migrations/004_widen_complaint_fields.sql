-- Migration 004: Widen Complaint Fields for Historical Grievances
ALTER TABLE complaints ALTER COLUMN complainant_name TYPE TEXT;
ALTER TABLE complaints ALTER COLUMN contact_number TYPE VARCHAR(100);
