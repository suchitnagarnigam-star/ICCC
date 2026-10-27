# MCL ICCC Repository Audit & Detailed Work Plan

**Repository:** https://github.com/suchitnagarnigam-star/ICCC  
**Default branch inspected:** `main`  
**Audit date:** 27 October 2026  
**Purpose:** Compare the current repository against the MCL Smart Complaint Management System plan, identify what genuinely exists in code, what is only described in documentation, the major risks, and the exact work needed to make the application production-ready.

> **Scope note:** This is a remote source-code review of selected files available through GitHub. I did not clone, install, run, or execute the application, connect to its database, test a deployed instance, or inspect the binary contents of the Excel workbook. Findings are therefore code-inspection findings, not a runtime or security penetration test. Statements such as “implemented” mean visible in source/config, not proven operational end to end.

---

## 1. Executive summary

The repository is a **useful working prototype and product scaffold**, but it should not yet be treated as a production complaint-management system. It already contains a lot of the right surface area: citizen intake and tracking screens, complaint detail/timeline UI, initial category list, a 95-ward mapping file, Express routes, PostgreSQL schema, Drive integration code, push-related schema/configuration, status and verification concepts, and a fairly detailed `Mplan.md`.

The most important issue is the gap between the documented architecture and the current execution path. For example, a PostgreSQL schema exists, but complaint routes currently operate on a seeded in-memory `COMPLAINTS_STORE`; login uses a hard-coded `MOCK_USERS` object; generic status changes trust the status submitted by the caller; and the complaint creation route calculates `dueAt` as 48 elapsed clock hours even though the plan says 48 working hours. The Drive media route also appears to serve files without authentication or complaint-level authorization and uses public cache headers.

**Recommendation:** do not rebuild the UI from zero. Preserve the useful prototype screens and domain model, but prioritize backend correctness, persistence, authorization, SLA logic, notification delivery, import/reconciliation, and end-to-end tests before relying on this system for real MCL data.

### Readiness assessment

| Area | Source-code assessment | Meaning |
|---|---|---|
| Product direction and UX scaffold | Strong | Useful basis to continue from |
| Citizen registration/tracking UI | Partially implemented | Screens exist; account scoping and full workflows are not proven |
| Category and ward reference data | Present in code | Needs validation against authoritative MCL sources |
| Automatic officer mapping | Present as static roster logic | Mapping reliability and currentness must be confirmed |
| Database-backed complaint persistence | Critical gap in inspected route | Schema exists but route logic shown uses in-memory seeded records |
| Authentication and authorization | Critical gap | Auth route has hard-coded dev users and routes lack consistent guards |
| Status lifecycle/verification | Partially present, unsafe | Actions exist but arbitrary status changes and actor identity trust need fixing |
| 48-working-hour SLA | Specified, not correctly implemented in creation route | Current new-complaint due date is 48 consecutive hours |
| In-app/push notifications | Schema/config/design present; end-to-end service not verified | Must prove event creation, dispatch, retries, and UI inbox |
| Private media storage | Partially present | Drive/cache code exists, but private access and failure semantics need work |
| Existing-record import | Referenced in plan/workbook | Import pipeline not found in inspected routes/files |
| Analytics/dashboard | Some operational UI and filters exist | Must be driven by real DB queries and reconciled metrics |
| Testing/production readiness | Very limited visible automated coverage | Existing health test uses seeded data and doesn't validate core safety rules |

---

## 2. Repository inventory

### Top-level files and directories

- `Frontend/`: React 19, TypeScript, Vite UI.
- `server/`: TypeScript/Express API.
- `Mplan.md`: detailed product and implementation specification.
- `workflow.pdf`: workflow reference, not inspected in this code-only pass.
- `MCL Control Room ICCC.xlsx`: workbook referenced by README as containing 951 historical grievances and administrative master sheets; binary content was not decoded by the GitHub text-file endpoint, so the stated row count/content remains unverified in this audit.
- `server/src/data/wardMasterData.json`: static ward-level officer mapping data.
- `server/src/migrations/001_core_schema.sql`: initial PostgreSQL schema.

### Frontend screens inspected

- `Frontend/src/pages/HomePage.tsx`
- `Frontend/src/pages/RegisterComplaintPage.tsx`
- `Frontend/src/pages/TrackComplaintsPage.tsx`
- `Frontend/src/pages/ComplaintDetailPage.tsx`
- `Frontend/src/pages/LoginPage.tsx`
- `Frontend/src/context/AuthContext.tsx`
- `Frontend/src/shared/utils/apiConfig.ts`

### Backend files inspected

- `server/src/app.ts`
- `server/src/config/env.ts`
- `server/src/config/db.ts`
- `server/src/migrations/001_core_schema.sql`
- `server/src/migrations/runMigrations.ts`
- `server/src/routes/authRoutes.ts`
- `server/src/routes/complaintRoutes.ts`
- `server/src/routes/referenceRoutes.ts`
- `server/src/routes/driveRoutes.ts`
- `server/src/services/officerMappingService.ts`
- `server/src/services/driveService.ts`
- `server/src/types/complaint.ts`
- `server/src/tests/healthTest.ts`

The README describes an event outbox/push service path, but a dedicated push-service module referenced in the plan was not found at the expected path in the inspected repository tree; its end-to-end implementation should therefore be treated as **not verified** until located and tested.

---

## 3. What is already good and should be retained

### 3.1 Product/workflow direction

`Mplan.md` captures the intended workflows in detail:

- registered citizen accounts and `My Complaints` concept;
- citizen complaint intake with description, category, media and map pin;
- verified ward/zone/department/JE mapping with operator review fallback;
- JE acknowledgement, progress, blocker reporting and resolution evidence;
- separation of resolution submission from final verification/closure;
- citizen dispute/rework flow;
- operator review queues, follow-up and shift handover;
- configurable 48-working-hour deadline and escalation hierarchy;
- in-app and push notifications first, SMS later;
- import reconciliation; and
- dashboards, aging, area/workload summaries, and deferred AI features.

The right product principle is already articulated: **resolution is not closure**. Preserve it in code through explicit backend transitions, not just UI messaging.

### 3.2 Useful UI foundation

The citizen intake screen has categories loading from a reference endpoint, multipart evidence selection, file-size/type checks in the client, address/ward/landmark fields, and a submitted-receipt state. The tracking screen has branch/status filters, search, SLA display and complaint detail navigation. The complaint detail screen has tabs for overview/timeline/evidence/actions and calls dedicated endpoint-shaped operations such as acknowledge, status, assignment, resolution and verification.

These screens are a useful starting point. The priority is to wire them to real authenticated DB-backed services, correct their data assumptions, and test their permissions—not throw them away.

### 3.3 Database schema has a useful starting point

`001_core_schema.sql` defines tables for:

- departments, zones, wards;
- users and complaint categories;
- staff area assignments;
- complaints;
- status history and assignment history;
- evidence/media;
- complaint verification;
- operator shift handovers;
- push subscriptions and notification events/outbox; and
- audit logs.

This is a solid initial domain schema. It still needs design review, constraints, migrations, DB-backed service functions and runtime validation.

### 3.4 Mapping and category catalogue

`referenceRoutes.ts` contains the 15 supplied complaint types and their branch/joint labels, plus four zones and ward lookup. `officerMappingService.ts` resolves ward + branch into an officer and supervisor metadata using `wardMasterData.json`. This is useful for prototyping, but the data should be validated, versioned and made administratively maintainable rather than treated as permanently authoritative static data.

### 3.5 Media handling foundation

The Drive service has a backend-mediated upload/retrieval path and local cache fallback. The schema can retain media purpose, uploader and optional resolver device location/accuracy. These are good ingredients, but private-access and reliability behavior require changes detailed below.

---

## 4. Critical findings requiring attention

Severity meanings:
- **P0 — Blocker:** must be addressed before trusted operational data or production use.
- **P1 — MVP requirement:** needed for the committed functionality to work reliably.
- **P2 — Improvement:** can follow once the core path is proven.

### P0-1: Complaint routes use an in-memory seeded store instead of PostgreSQL

**Evidence:** `server/src/routes/complaintRoutes.ts` declares `const COMPLAINTS_STORE: Complaint[]` with seeded examples, and list/detail/create/status/assign/resolution/verify-close handlers mutate that array. Restarting the server resets these mutations; they are not the source of truth in PostgreSQL. Meanwhile `001_core_schema.sql` defines a complaints table and `db.ts` provides a pool.

**Impact:** data loss on restart, multiple server instances disagreeing, fake seeded results, dashboard counts not being authoritative, and no real import-backed operational history.

**Work required:**
1. Create a repository/service layer for complaint persistence, assignments, status history, media metadata, reviews and verifications.
2. Rewrite all complaint handlers to read/write PostgreSQL transactions instead of `COMPLAINTS_STORE`.
3. Ensure complaint creation and initial status/assignment/audit/notification outbox events are inserted transactionally.
4. Remove seeded complaint records from runtime; seed only isolated development/test fixtures.
5. Add integration tests that create a complaint, restart/reconnect to the DB, and confirm it persists.

### P0-2: Authentication is mocked; the declared user table is not the login source

**Evidence:** `server/src/routes/authRoutes.ts` defines `MOCK_USERS` with hard-coded phone numbers and PIN `1234`; the `LoginPage.tsx` exposes development quick-fill buttons with these credentials. `AuthContext.tsx` stores a 365-day JWT in `localStorage`. The code is not yet shown validating credentials against the `users` table or an approved identity provider.

**Impact:** anyone knowing the demo credentials can access the demo roles; production identity, account lifecycle and user provisioning are not established. A 365-day bearer token stored in localStorage increases impact if script injection occurs.

**Work required:**
1. Separate development-only seed/demo identities from production and fail startup in production if mock auth or fallback secrets are configured.
2. Authenticate against approved identities in DB or approved identity provider; use individual accounts.
3. Add secure account activation/deactivation, password/PIN reset and brute-force throttling/lockout rules.
4. Review token lifetime and storage; use appropriately short-lived access tokens and a considered refresh/session strategy.
5. Remove quick-fill UI from production builds.
6. Tests: invalid credentials, inactive user, wrong role, expired token, disabled user, rate limits.

### P0-3: Workflow endpoints trust caller-supplied status and actor information

**Evidence:** `POST /api/complaints/:id/status` reads `status`, `actorName` and `actorRole` from `req.body`, then assigns the arbitrary status and records the supplied actor values. `acknowledge`, `assign`, `resolution`, and `verify-close` handlers inspected similarly accept names/roles/IDs from request body or infer defaults instead of consistently deriving identity from authenticated server context. The routes shown do not attach `authenticateToken` / role-and-area permission middleware.

**Impact:** a caller can impersonate an actor, bypass valid status transitions, alter assignments and potentially close a complaint without authorized verification. Audit history cannot be trusted if actor metadata is client-controlled.

**Work required:**
1. Require authenticated identity on all staff/citizen protected endpoints.
2. Derive actor ID, role, name and permitted area from verified session/database data; never trust caller-provided actor identity.
3. Implement a backend-owned state machine and explicit action-specific transitions.
4. Enforce ownership: JE may update only assigned/authorized complaints; citizen may see/verify only their own complaint; operator/supervisor actions are scoped.
5. Validate each action's required fields and reason.
6. Use transactions to mutate complaint, histories, verification, and notification outbox.
7. Add unauthorized-role, cross-ward and invalid-transition tests.

### P0-4: Media endpoint appears publicly retrievable and uses public cache headers

**Evidence:** `server/src/routes/driveRoutes.ts` handles `GET /api/drive/files/:fileId` without visible authentication or complaint-level authorization and sets `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`. It allows SVG media. `driveService.ts` returns a local mock folder URL on Drive failure and falls back to local cache files.

**Impact:** complaint photos or documents may be disclosed to anyone with a file ID; shared/proxy caches may retain sensitive evidence. SVG may introduce active-content risk depending on how it is delivered/rendered. Mock success can mask real storage failures.

**Work required:**
1. Authenticate media access and authorize it against complaint ownership/role/area before returning bytes.
2. Use private/no-store or carefully scoped caching; never shared-public cache sensitive complaint evidence.
3. Exclude SVG unless there is a validated sanitization/use case; enforce server-side content detection and safe content-disposition.
4. Associate each media reference with a complaint and purpose in the DB.
5. Do not report successful remote upload when only mock/local fallback happened; surface storage state and alert.
6. Ensure temporary files are cleaned, cache is bounded/managed, file IDs cannot traverse paths, and production storage fallback policy is explicit.
7. Test unauthorized access, another-citizen access, expired links, missing Drive file and storage outage.

### P0-5: SLA shown in the plan is not what the create route computes

**Evidence:** complaint creation sets `dueAt = new Date(Date.now() + 48 * 3600000)`, i.e. 48 elapsed clock hours. `TrackComplaintsPage.tsx` also computes remaining time by raw millisecond difference. `env.ts` has working-day configuration fields but the creation path shown does not use a working-hours calculation service. `HomePage.tsx` states a Mon–Fri 09:00–17:00 schedule excluding gazetted holidays, but this is currently UI copy, not proof of a configured holiday-aware calendar.

**Impact:** displayed deadline/overdue status will be incorrect over nights, weekends and holidays, and it may not be consistent across backend/UI.

**Work required:**
1. Implement a server-only deadline service using `Asia/Kolkata`, configurable business hours, working days, holiday calendar, pause rules and clock-start event.
2. Store the policy version used for each deadline and preserve adjustment history.
3. Backend computes `due_at`; frontend displays the backend's remaining/overdue state rather than independently deciding the SLA.
4. Implement scheduled due/reminder/escalation checks robustly (idempotent job or worker; not dependent only on a page being open).
5. Tests for boundary cases: complaint before/after shift, Friday to Monday, holidays, pauses and reassignment.

### P0-6: PostgreSQL migration runner is not safely repeatable as shown

**Evidence:** `runMigrations.ts` reads every `.sql` file and executes it each run, without a migration ledger/version table or transaction management at runner level. The current initial file uses `IF NOT EXISTS` in many tables/indexes, but that does not make future schema changes safely tracked.

**Impact:** future deployments cannot reliably know which changes ran; partial failures and schema drift become difficult to recover from.

**Work required:** add a `schema_migrations` ledger with migration name/checksum/applied_at; apply each migration once inside a transaction when feasible; lock migration execution; fail safely on checksum drift; document backup and rollback strategy.

---

## 5. Important MVP gaps (P1)

### P1-1: Existing complaint import is specified but not implemented in the inspected file set

The README/Mplan reference `MCL Control Room ICCC.xlsx` as historical grievances and administrative master data. The schema has `source_system` and `source_id`, which is useful, but no import CLI/API, dry-run, batch ledger, row exception report or reconciliation flow was found in inspected routes/files.

**Build:** import batch and row-result tables, schema/profile validation, field mapping, dry run, duplicate review, idempotent import, row errors, data reconciliation report, audit trail and test fixtures. The workbook must be read and profiled before defining final column mappings. The workbook itself wasn't decoded in this audit; do not assume the stated 951 rows or sheet structure without verification.

### P1-2: Citizen experience conflicts with “registered accounts” policy

`RegisterComplaintPage.tsx` accepts name and contact on the form and submits without requiring a logged-in citizen. `TrackComplaintsPage.tsx` calls the broad `/complaints` list endpoint and filters in the browser. There is no visible server-enforced “My Complaints” scope in the inspected route.

**Build:** enforce authentication for citizen create/list/detail; derive `citizen_id` from auth session; implement `/me/complaints`-style scoped queries; ensure list endpoints do not expose all complaint data to citizens; support saved citizen addresses; preserve hotline/operator-created complaints with a clearly defined source and citizen linkage.

### P1-3: Data schema and runtime model are inconsistent

The migration defines UUID primary keys and database references, while runtime records use string IDs like `cmp-001`, category IDs like `'6'`, generated officer IDs such as `je-br-w64`, and seeded values. The mapping service synthesizes officer IDs from ward/branch rather than resolving active `users` rows. Tables also have delete cascades on status/history/media/assignments, which can conflict with the requirement to retain audit history if parent complaints are hard-deleted.

**Build:** standardize UUID internal identifiers, keep public complaint number as a unique external identifier, convert category and staff mappings to database FK records, preserve source IDs separately, and define retention-safe soft deletion/disposition. Do not physically cascade-delete operational history.

### P1-4: The 15 complaint types exist in code, but are not being loaded from DB

`referenceRoutes.ts` exports an in-code `INITIAL_COMPLAINT_CATEGORIES` list. The schema includes `complaint_categories`, but the public reference endpoint returns the constant. This creates a second source of truth, and category IDs may not match the UUID FK expected in PostgreSQL.

**Build:** seed the 15 initial categories through a versioned migration or idempotent seeding procedure; API returns database values; admin can activate/deactivate/configure categories; preserve original source labels and spelling; retain branch/joint mapping without free-text drift.

### P1-5: Assignment mapping is hardcoded and may be stale

`officerMappingService.ts` uses static JSON and constructs pseudo officer IDs. It resolves ward + branch, but not a verified, effective-dated assignment record. The reference routes provide publicly readable ward staff details. Actual responsibilities and telephone details should be confirmed and protected as necessary.

**Build:** import authoritative roster into tables with effective dates, validate each ward/branch has a valid current staff record, retain history, support reassignment, and direct mapping gaps/conflicts to operator queue. Avoid exposing staff contact detail in public endpoints unless intended.

### P1-6: Notification tables/configuration exist, but end-to-end push/in-app delivery isn't proven

`001_core_schema.sql` defines `push_subscriptions` and `notification_events` with idempotency/delivery fields; `env.ts` includes VAPID variables. A notification service path is described in README, but a dedicated push service wasn't found at the expected path in the returned repository tree. No notification list/read routes or notification centre UI were seen in the inspected inventory.

**Build:** complete outbox worker, in-app notification rows/inbox, push subscription registration/revocation, recipient resolver, event templates, provider error handling, backoff, idempotency, read/unread state, notification deep links, event-recipient matrix tests, and operator monitoring. SMS stays deferred. Ensure event insertion is in the same transaction as the complaint state change; dispatch asynchronously.

### P1-7: Resolution/verification route needs actual actor authorization and data records

The schema has `complaint_verifications`, and a verify-close endpoint exists, but the handler inspected unconditionally sets status to `CLOSED` based on the complaint ID and reads `closedBy`/`actorRole` from the request body. It does not visibly validate the caller is the complaint's citizen or an authorized reviewer, check the current state, require a confirmation result, or insert a row into `complaint_verifications`.

**Build:** explicit citizen confirm/dispute action; reviewer action; mandatory reason on dispute; DB-backed verification row; role ownership checks; rework transition; no duplicate resolution overwrite; approved officer override policy; tests for unrelated citizen and unauthorized staff.

### P1-8: List endpoint and dashboard queries are not fit for broad access

The inspected list endpoint filters an in-memory collection and returns all matching records with contact info and nested evidence references; no pagination or scoped query is visible. The UI filters/searches client-side, which will not scale and risks exposing records if authorization isn't applied first.

**Build:** DB filters, pagination, sorting, server-side role/area scoping, carefully designed projections per role, aggregate KPI endpoints, and reconciliation tests.

### P1-9: Evidence upload uses asynchronous background processing with mock fallback

Complaint creation responds success before Drive upload finishes and does not show a durable media-job row or explicit media-upload state. If upload fails, logs are written, but the response has already told the user success and the temporary URLs may remain in the in-memory record. A local fallback may be fine in development but not enough for production.

**Build:** persist complaint first with media rows and upload states; return a truthful response; use retryable durable jobs/outbox; expose pending/failed media state and admin diagnostics; guarantee no orphan records. Define whether complaint intake may be accepted while media sync is pending.

### P1-10: Core tests are smoke tests, not lifecycle/security tests

`server/src/tests/healthTest.ts` checks health, category count, seeded complaint list, and creation. It does not prove persistence after restart, valid state transitions, role scoping, notification delivery, SLA behavior, private media access, import reconciliation or rework.

**Build:** unit tests for pure services and integration tests using a test database; API tests across each role; full lifecycle tests; migration smoke test against empty DB; concurrency/idempotency tests; notification retry tests; media access tests; import fixtures.

---

## 6. Other risks and recommendations (P2)

1. **Token security:** `JWT_SECRET` currently falls back to a literal secret in `env.ts`, and `.env.example` contains a demo-looking fixed secret. Production must require a supplied secret and fail fast if missing/weak.
2. **Long session lifetime:** `JWT_EXPIRES_IN=365d` combined with localStorage should be reconsidered before deployment.
3. **CORS:** `app.ts` uses `origin: true` with credentials. Restrict to configured known client origins in production.
4. **File validation:** client-side MIME/size validation is not enough. Validate file signature, type, dimensions/size and malware policy on the server. SVG is included in media retrieval allowlist; omit unless sanitized.
5. **Media caching:** cache path should be controlled, cache size/eviction documented, and private media should not carry public caching headers.
6. **Sensitive logging:** `db.ts` logs complete SQL text and error objects on failures; review for PII/secrets and sanitize logs.
7. **SQL/driver discipline:** use parameterized SQL everywhere; keep DB service modules narrow and transactional boundaries clear.
8. **Operational observability:** add structured logs, request IDs, queue/job health, readiness checks, metrics for DB, push, storage and imports, and a documented backup/restore drill.
9. **Accessibility/localization:** mobile-first low-bandwidth design, clear language, keyboard access and agreed Punjabi/English support should be tested rather than assumed.
10. **SLA semantic consistency:** `TrackComplaintsPage.tsx` excludes `RESOLUTION_SUBMITTED` from breach in a UI calculation, while due clock meaning and state eligibility need one central domain rule. Avoid multiple slightly different SLA implementations.
11. **Reference route visibility:** `/api/reference/wards` returns staff details from the static data; scope this to authenticated staff/admin or return only fields intended for public consumption.
12. **Workflow endpoint state validation:** `resolution` should be allowed only from specified states; `verify-close` only when resolution is submitted; assignment changes should preserve due-time policy history; invalid state changes must return 409/400 consistently.

---

## 7. Exact work backlog, in priority order

### Sprint 0 — Contain unsafe prototype behavior

- [ ] Add production startup checks that reject mock auth, fallback JWT secret, and mock storage mode.
- [ ] Remove quick-fill/demo credentials from production UI.
- [ ] Protect all staff/citizen endpoints with authentication and role/area authorization.
- [ ] Protect media routes with complaint-scoped authorization and remove public caching.
- [ ] Disable or guard generic arbitrary status mutation until state machine enforcement is implemented.
- [ ] Add an environment/configuration matrix for dev/test/staging/production.

**Exit:** production cannot start with mock credentials; unauthorized users cannot browse complaints or media; sensitive routes are protected.

### Sprint 1 — PostgreSQL as the one source of truth

- [ ] Implement DB repository/service modules for complaints, users, categories, assignment history, media, status history, verifications, follow-ups and audit logs.
- [ ] Rewrite list/detail/create/status/assign/acknowledge/resolution/verification endpoints to use DB transactions.
- [ ] Standardize internal UUID vs public complaint number and source-system IDs.
- [ ] Add schema migration ledger and idempotent migration strategy.
- [ ] Add DB-backed category and geography endpoints and seed the initial 15 categories.
- [ ] Remove seeded `COMPLAINTS_STORE` from runtime; provide isolated fixtures for tests only.

**Exit:** create a record, restart the server, and retrieve the same record with consistent history.

### Sprint 2 — Identity, scope and auditability

- [ ] Replace `MOCK_USERS` with DB/approved identity lookup.
- [ ] Introduce explicit permission checks for citizen, JE, operator, supervisors and admin.
- [ ] Derive actor identity from JWT/session and DB; ignore client actor name/role fields.
- [ ] Enforce citizen-only-own-complaints and staff area scope at query level.
- [ ] Implement audited correction and non-destructive invalid/duplicate disposition.
- [ ] Add cross-ward and cross-citizen access tests.

**Exit:** every data-changing action has an authenticated actor, permission decision and audit event.

### Sprint 3 — Correct complaint state machine and verification

- [ ] Centralize states/transitions and allowed actor/action matrix in backend domain service.
- [ ] Validate assignment, acknowledgement, progress, waiting, blocker, resolution submission, review, dispute, citizen verification, authorized officer verification, reopen and close.
- [ ] Store each verification and each resolution attempt separately.
- [ ] Enforce mandatory reasons for rejection, rework, reassignment and override.
- [ ] Complete citizen `My Complaints` flow and account ownership.
- [ ] Add resolver location metadata and saved address tables/UI.

**Exit:** full lifecycle and all unauthorized/invalid transitions tested.

### Sprint 4 — 48 working-hour SLA and escalation

- [ ] Implement server-side working-calendar calculation.
- [ ] Configure `Asia/Kolkata`, work days/times, holidays, pauses, clock-start event and policy version.
- [ ] Add durable scheduler/worker, due reminders and escalation events.
- [ ] Avoid duplicate reminders and record each escalation/action.
- [ ] Use server-computed SLA states in list/detail/dashboard APIs.

**Exit:** automated tests pass for Friday/Monday, holidays, after-hours submissions, pause/reassignment and no-auto-close rules.

### Sprint 5 — Notification system

- [ ] Complete transactional outbox and background delivery worker.
- [ ] Complete in-app notification table/read state and notification centre UI.
- [ ] Complete push subscription lifecycle, recipient resolution, VAPID setup and delivery retries.
- [ ] Implement templates and event/recipient/channel matrix from Mplan.
- [ ] Add safe deep links and delivery observability.
- [ ] Keep SMS disabled but leave channel adapter contract for future use.

**Exit:** events aren't lost when provider is down; retries don't duplicate; push denied still leaves in-app record.

### Sprint 6 — Existing complaints and import/reconciliation

- [ ] Download and profile the source workbook in a local workbook-aware environment.
- [ ] Verify actual sheet names, row counts, headers, data types, data quality and sensitive fields before designing column mapping.
- [ ] Build a dry-run importer with row-level error reasons, source IDs, mapping version and idempotent batch key.
- [ ] Map source categories/statuses and current staff assignments without inventing missing information.
- [ ] Produce duplicate candidates and unclear-ownership queue for operator resolution.
- [ ] Reconcile source vs imported/linked/rejected/review counts and get MCL sign-off.

**Exit:** auditable import report fully reconciles and a safe rollback/restore plan exists.

### Sprint 7 — Operator operations, shift handover and dashboard

- [ ] Complete searchable/paginated DB-backed complaint register.
- [ ] Add review/assignment exception queues and follow-up scheduling.
- [ ] Add explicit handover records tied to open cases and next actions.
- [ ] Build real aggregate endpoints for status, aging, SLA, workload, times-to-action, repeat/reopen, unresolved ownership and verification backlog.
- [ ] Add ward/zone/branch filters and maps only where data quality allows it.
- [ ] Ensure all totals reconcile with DB queries and have clear date range/denominator semantics.

**Exit:** operators and supervisors can handle daily case work without relying on mock data or manual ad hoc tracking.

### Sprint 8 — Pilot/production hardening

- [ ] Run the full test matrix, permission tests, load/large-list tests and backup-restore drill.
- [ ] Validate private evidence access and media retention.
- [ ] Validate push notification behavior across supported browsers/devices.
- [ ] Confirm working calendar, escalation sequence, verification override rules and import reconciliation with MCL.
- [ ] Use a limited pilot with monitored feedback, runbooks, and defect triage.
- [ ] Add SMS and deferred priority/AI only after core workflow acceptance.

**Exit:** all P0 issues closed, P1 acceptance tests pass, MCL signs off operational policies and pilot criteria.

---

## 8. Required artifacts to finish correctly

### From MCL / source system

1. A source workbook/export with confirmed data owner and permission to use it.
2. Current complaint status definitions and any source-system IDs.
3. Official 95-ward/zone mapping and current JE-to-branch/ward assignment roster, including effective dates/contact details as permitted.
4. Approved working calendar and SLA clock-start/pause rules.
5. Notification/escalation recipients and level thresholds.
6. Approved citizen/officer verification and closure policy.
7. Hosting, privacy, media-retention and account-provisioning requirements.

### From the engineering environment

1. Development/staging PostgreSQL database and migration process.
2. Valid environment secrets; no production use of default JWT secret or mock users.
3. Google Drive/alternative storage configuration, least privilege and access tests.
4. VAPID keys and supported-browser push test matrix.
5. CI build/test commands and environment-specific configuration.
6. Backup/restore setup, structured logs and error monitoring.

---

## 9. Recommended starting sequence

Do **not** start by adding more dashboard cards. Start by proving that a single complaint can be safely processed with one source of truth:

1. Registered citizen (or an authorized operator acting on behalf of a citizen) creates a complaint.
2. Backend writes complaint, initial status history, assignment history, media references and notification event to PostgreSQL.
3. Trusted mapping assigns a real active JE record; uncertain mapping enters the operator review queue.
4. JE signs in with an individual account, acknowledges and updates the complaint.
5. JE submits resolution note, evidence and available resolver location.
6. Citizen or authorized officer verifies; a dispute returns to work with a reason.
7. The server calculates the correct 48-working-hour SLA, logs due reminders/escalations, and doesn't auto-close.
8. The notification system delivers in-app/push alerts with read/delivery state.
9. Operator can audit the entire timeline and hand over the case across shifts.
10. Dashboard counts match the database and the record persists after server restart.

When this one end-to-end path passes all tests, expand to the migrated backlog and all role/area workflows.

---

## 10. Final recommendation

The repository contains meaningful product and implementation work, particularly the front-end forms, categories, ward mapping scaffold, relational schema, workflow design and media proxy. Keep that work.

The next effort should be a **correctness and integration pass**, not another broad feature sprint. First replace in-memory complaints and mock authentication, enforce server-derived identity and valid lifecycle transitions, secure evidence retrieval, and implement the 48-working-hour SLA correctly. Then complete durable notifications and the workbook import pipeline. Only after those foundations are proven should the application be treated as ready for a controlled MCL pilot.
