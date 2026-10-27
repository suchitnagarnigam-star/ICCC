import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'production' ? '' : 'mcl_iccc_fallback_secret_key_2026');

if (nodeEnv === 'production') {
  if (!jwtSecret || jwtSecret === 'mcl_iccc_fallback_secret_key_2026' || jwtSecret.length < 32) {
    throw new Error(
      'FATAL SECURITY CONFIGURATION: In production mode, JWT_SECRET must be explicitly set with a high-entropy secret (at least 32 characters).'
    );
  }
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: nodeEnv,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || '',
  PGSSLMODE: process.env.PGSSLMODE || 'require',
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
  SLA_TARGET_WORKING_HOURS: parseInt(process.env.SLA_TARGET_WORKING_HOURS || '48', 10),
  SLA_CLOCK_START_EVENT: process.env.SLA_CLOCK_START_EVENT || 'SUBMITTED',
  MCL_WORK_DAY_START: process.env.MCL_WORK_DAY_START || '09:00',
  MCL_WORK_DAY_END: process.env.MCL_WORK_DAY_END || '17:00',
  MCL_TIMEZONE: process.env.MCL_TIMEZONE || 'Asia/Kolkata',
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || '',
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY || '',
  VAPID_SUBJECT: process.env.VAPID_SUBJECT || 'mailto:admin@mcl.gov.in',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '',
  GOOGLE_DRIVE_EVIDENCE_FOLDER_ID: process.env.GOOGLE_DRIVE_EVIDENCE_FOLDER_ID || '',
};
