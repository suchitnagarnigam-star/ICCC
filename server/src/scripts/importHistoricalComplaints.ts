import { execSync } from 'node:child_process';
import path from 'node:path';
import { getDbPool } from '../config/db';
import { calculateWorkingHourDeadline } from '../services/slaService';
import { UserRepository } from '../repositories/userRepository';

interface ExtractedComplaint {
  sourceId: string;
  sequenceNumber: number;
  submittedAt: string;
  wardNumber: number | null;
  zone: string | null;
  categoryRaw: string;
  branch: 'B&R' | 'O&M' | 'Health' | 'Light';
  mode: string;
  complainantName: string;
  contactNumber: string;
  address: string | null;
  landmark: string | null;
  description: string;
  assignedOfficerRaw: string | null;
  status: 'CLOSED' | 'ASSIGNED';
  remarks: string | null;
  resolution: string | null;
}

// Category matching map from Excel text to category codes
const CATEGORY_MAP: Record<string, string> = {
  'potholes': 'cat_06',
  'new road construction': 'cat_05',
  'new road gully': 'cat_05',
  'sewerage/road jalis overchock': 'cat_12',
  'sewerage/road jalis desiliting': 'cat_13',
  'new pipeline water/sewer': 'cat_15',
  'water logging': 'cat_14',
  'contamination': 'cat_10',
  'street light issues': 'cat_01',
  'open manhole': 'cat_03',
  'leakage pipeline': 'cat_08',
  'blocked road gully': 'cat_11',
  'old pipeline burst': 'cat_09',
  'tree fall': 'cat_02',
  'garbage valnuerable points': 'cat_04',
};

function matchCategoryCode(categoryRaw: string, branch: string): string {
  const norm = categoryRaw.toLowerCase();
  for (const [key, code] of Object.entries(CATEGORY_MAP)) {
    if (norm.includes(key)) {
      return code;
    }
  }
  // Default based on branch
  if (branch === 'B&R') return 'cat_06';
  if (branch === 'Light') return 'cat_01';
  if (branch === 'Health') return 'cat_04';
  return 'cat_12'; // O&M default
}

async function runImporter() {
  const args = process.argv.slice(2);
  const isExecute = args.includes('--execute');
  const isDryRun = !isExecute || args.includes('--dry-run');

  console.log('====================================================');
  console.log(`📦 MCL ICCC Historical Grievance Importer`);
  console.log(`🚀 Mode: ${isExecute ? 'EXECUTE (Writing to Neon PostgreSQL)' : 'DRY RUN (Safety Profiling Only)'}`);
  console.log('====================================================');

  const excelPath = path.resolve(process.cwd(), '../MCL Control Room ICCC.xlsx');
  const scriptPath = path.resolve(__dirname, 'extractExcelComplaints.py');

  console.log(`🔍 Extracting complaints from ${excelPath}...`);
  const rawOutput = execSync(`python3 "${scriptPath}" "${excelPath}"`, { maxBuffer: 30 * 1024 * 1024 }).toString();
  const records: ExtractedComplaint[] = JSON.parse(rawOutput);

  console.log(`✓ Successfully extracted ${records.length} historical complaints from workbook.`);

  const pool = getDbPool();

  // Cache categories from DB
  const catRes = await pool.query<{ id: string; code: string; name: string }>(
    'SELECT id, code, name FROM complaint_categories'
  );
  const catCodeToId = new Map(catRes.rows.map((c) => [c.code, c.id]));

  // Cache officers by ward & branch for high-speed resolution
  const officerCache = new Map<string, string>(); // `ward-branch` -> userId
  const officerRows = await pool.query<{ user_id: string; ward_number: number; branch: string }>(
    'SELECT user_id, ward_number, branch FROM staff_area_assignments WHERE is_primary = TRUE'
  );
  officerRows.rows.forEach((r) => {
    officerCache.set(`${r.ward_number}-${r.branch}`, r.user_id);
  });

  console.log(`✓ Cached ${catCodeToId.size} categories and ${officerCache.size} primary territorial officers.`);

  // Check existing records in DB
  const existingRes = await pool.query<{ source_id: string }>(
    `SELECT source_id FROM complaints WHERE source_system = 'MCL_EXCEL'`
  );
  const existingSourceIds = new Set(existingRes.rows.map((r) => r.source_id));
  console.log(`✓ Currently in database: ${existingSourceIds.size} historical records.`);

  let skippedExisting = 0;
  let readyToInsert = 0;
  let resolvedOfficers = 0;
  let closedCount = 0;
  let assignedCount = 0;

  for (const rec of records) {
    if (existingSourceIds.has(rec.sourceId)) {
      skippedExisting++;
      continue;
    }

    readyToInsert++;
    if (rec.status === 'CLOSED') closedCount++;
    else assignedCount++;

    if (rec.wardNumber && officerCache.has(`${rec.wardNumber}-${rec.branch}`)) {
      resolvedOfficers++;
    }
  }

  console.log('\n--- Profiling Summary ---');
  console.log(`Total Records Extracted : ${records.length}`);
  console.log(`Already in Database     : ${skippedExisting}`);
  console.log(`New Records to Ingest   : ${readyToInsert}`);
  console.log(`- Status: CLOSED        : ${closedCount}`);
  console.log(`- Status: ASSIGNED      : ${assignedCount}`);
  console.log(`- Officer Resolved      : ${resolvedOfficers} / ${readyToInsert}`);

  if (isDryRun) {
    console.log('\n====================================================');
    console.log('✅ DRY RUN COMPLETE: Data verified without database modifications.');
    console.log('To execute the real import into Neon PostgreSQL, run:');
    console.log('npx tsx src/scripts/importHistoricalComplaints.ts --execute');
    console.log('====================================================');
    process.exit(0);
  }

  console.log('\n🚀 Starting batch transactional ingestion into Neon PostgreSQL...');
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const chunk = records.slice(i, i + BATCH_SIZE);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const rec of chunk) {
        if (existingSourceIds.has(rec.sourceId)) continue;

        const complaintNumber = `MCL-HIST-${String(rec.sequenceNumber).padStart(4, '0')}`;
        const catCode = matchCategoryCode(rec.categoryRaw, rec.branch);
        const categoryIdUuid = catCodeToId.get(catCode) || null;
        const assignedJeId = rec.wardNumber ? officerCache.get(`${rec.wardNumber}-${rec.branch}`) || null : null;

        const submittedDate = new Date(rec.submittedAt);
        const dueAt = calculateWorkingHourDeadline(submittedDate, 48).toISOString();
        const isClosed = rec.status === 'CLOSED';
        const closedAt = isClosed ? dueAt : null;
        const resolvedAt = isClosed ? dueAt : null;

        const insertRes = await client.query<{ id: string }>(
          `INSERT INTO complaints (
            complaint_number, source_system, source_id,
            complainant_name, contact_number, description,
            category_id, branch, current_status, mode,
            zone_code, ward_number, address, landmark,
            assigned_je_id, submitted_at, due_at,
            resolved_at, closed_at, sla_policy_version,
            created_at, updated_at
          ) VALUES (
            $1, 'MCL_EXCEL', $2,
            $3, $4, $5,
            $6, $7, $8, $9,
            $10, $11, $12, $13,
            $14, $15, $16,
            $17, $18, 'v1.0',
            $15, NOW()
          ) ON CONFLICT (complaint_number) DO NOTHING
          RETURNING id`,
          [
            complaintNumber,
            rec.sourceId,
            rec.complainantName,
            rec.contactNumber,
            rec.description,
            categoryIdUuid,
            rec.branch,
            rec.status,
            rec.mode,
            rec.zone,
            rec.wardNumber,
            rec.address,
            rec.landmark,
            assignedJeId,
            rec.submittedAt,
            dueAt,
            resolvedAt,
            closedAt,
          ]
        );

        if (insertRes.rows.length > 0) {
          const compId = insertRes.rows[0].id;

          // Status history: SUBMITTED
          await client.query(
            `INSERT INTO complaint_status_history (
              complaint_id, previous_status, new_status, action_reason, created_at
            ) VALUES ($1, NULL, 'SUBMITTED', $2, $3)`,
            [compId, `Imported from historical Excel workbook (${rec.sourceId})`, rec.submittedAt]
          );

          if (isClosed) {
            await client.query(
              `INSERT INTO complaint_status_history (
                complaint_id, previous_status, new_status, action_reason, created_at
              ) VALUES ($1, 'SUBMITTED', 'CLOSED', $2, $3)`,
              [compId, rec.resolution || rec.remarks || 'Historical grievance resolved and closed', dueAt]
            );
          } else if (assignedJeId) {
            await client.query(
              `INSERT INTO complaint_status_history (
                complaint_id, previous_status, new_status, action_reason, created_at
              ) VALUES ($1, 'SUBMITTED', 'ASSIGNED', $2, $3)`,
              [compId, 'Territory auto-assigned to primary field officer', rec.submittedAt]
            );
          }

          inserted++;
        }
      }

      await client.query('COMMIT');
      console.log(`✓ Progress: Ingested ${inserted} / ${readyToInsert} records...`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Batch import failed at offset ${i}:`, err);
      throw err;
    } finally {
      client.release();
    }
  }

  console.log('\n====================================================');
  console.log(`🎉 HISTORICAL IMPORT COMPLETED SUCCESSFULLY!`);
  console.log(`Total Inserted: ${inserted} complaints committed to Neon PostgreSQL.`);
  console.log('====================================================');
  process.exit(0);
}

runImporter().catch((err) => {
  console.error('Fatal import error:', err);
  process.exit(1);
});

