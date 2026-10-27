-- MCL ICCC Smart Municipal Complaint Management System
-- Migration 000: Schema Migration Ledger
-- Tracks applied migrations and enforces SHA-256 integrity

CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

