# MCL ICCC Smart Municipal Complaint Management System

**Organization:** Municipal Corporation Ludhiana (MCL)  
**System:** Integrated Command & Control Centre (ICCC)  
**Specification:** [`Mplan.md`](./Mplan.md)  
**Workflow Architecture:** [`workflow.pdf`](./workflow.pdf)  

---

## Architecture Overview

The MCL ICCC Complaint Management System automates the civic issue resolution lifecycle across Municipal Corporation Ludhiana. The architecture unifies citizen grievance intake, spatial geocoded boundary routing, mobile field dispatch to Junior Engineers (JEs), strict verification gates (preventing premature ticket closure), and automated 48-working-hour SLA escalation monitoring into an auditable, single-source-of-truth platform.

### Core Stack
- **Frontend:** React 19, TypeScript, Vite, Custom Punjab Civic CSS
- **Backend:** Node.js, Express 5, TypeScript (`tsx`)
- **Database:** PostgreSQL (Neon cloud pooling) with versioned migrations
- **Storage:** Google Drive API with secure backend proxy & local cache
- **Auth & Session:** 365-day persistent JWT session management + bcrypt PIN/password hashing
- **Notifications:** Web Push (RFC-8291/RFC-8292 VAPID) + transactional outbox

---

## Directory Structure

```
├── Frontend/                 # React 19 + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/       # Common civic UI components & headers
│   │   ├── context/          # 365-day AuthContext & state
│   │   ├── pages/            # Citizen, JE, Operator, Dashboard pages
│   │   ├── styles/           # Punjab civic design tokens & theme
│   │   └── types/            # Client-side TypeScript contracts
├── server/                   # Express 5 + TypeScript API Backend
│   ├── src/
│   │   ├── config/           # Environment and DB pool setup
│   │   ├── middleware/       # Auth, RBAC, and error handlers
│   │   ├── migrations/       # SQL schema DDL & migration runner
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # State machine, SLA, Drive proxy, Push
│   │   └── types/            # Unified data models & contracts
├── MCL Control Room ICCC.xlsx # Authoritative 95-ward roster & legacy complaints
├── Mplan.md                  # Comprehensive product & engineering specification
└── workflow.pdf              # Full architectural & state machine diagrams
```

---

## Getting Started

### 1. Server Setup
```bash
cd server
npm install
npm run build
npm run dev
```

### 2. Frontend Setup
```bash
cd Frontend
npm install
npm run build
npm run dev
```

