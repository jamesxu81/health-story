# Developer Quickstart Guide

**Project**: Health Story - Illness Tracker  
**Tech Stack**: Next.js 14, TypeScript, React 18, Tailwind CSS, PostgreSQL, Vercel Blob  
**Target**: Vercel serverless platform

---

## 1. Prerequisites

- **Node.js**: 18.17+ (check with `node --version`)
- **npm**: 9+ (included with Node.js)
- **Git**: For version control
- **PostgreSQL**: 14+ (for local development)
- **Vercel CLI**: For deployment (optional for local dev, `npm install -g vercel`)

---

## 2. Environment Setup

### 2.1 Clone Repository & Install Dependencies

```bash
# Clone repo
git clone <repo-url>
cd "Health Story"

# Install dependencies
npm install
```

Expected output: ~12-15 dependencies installed (Principle V: Simplicity)

### 2.2 Create Local Database

#### **Option A: Docker Compose (Recommended)** 🐳

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Verify it's running
docker-compose ps

# Expected output:
# NAME                COMMAND                  SERVICE     STATUS      PORTS
# health-story-db     "postgres"               postgres    Up (healthy) 5432/tcp
```

**What this does**:
- Starts PostgreSQL 14 container named `health-story-db`
- Creates database `health_story_dev` automatically
- Mounts `db/migrations/` directory (auto-runs SQL on startup)
- Persists data in Docker volume `health-story-db_postgres_data`
- Health check ensures DB is ready before proceeding

**Stop the database**:
```bash
docker-compose down          # Stop containers (data persists)
docker-compose down -v       # Stop + delete data volume (full reset)
```

#### **Option B: PostgreSQL installed locally**

```bash
# Create database
createdb health_story_dev

# Run migrations manually
psql health_story_dev < ./db/migrations/001-initial-schema.sql
```

Requires `psql` command-line tool installed.

#### **Option C: Docker (single container)**

```bash
docker run --name health-story-db \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_DB=health_story_dev \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -d postgres:14

# Run migrations manually
sleep 5  # Wait for startup
psql -h localhost -U dev -d health_story_dev < ./db/migrations/001-initial-schema.sql
```

### 2.3 Configure Environment Variables

Create file: `.env.local`

```bash
# Database
DATABASE_URL=postgresql://dev:devpass@localhost:5432/health_story_dev

# Vercel Blob (for file uploads)
BLOB_READ_WRITE_TOKEN=your_token_here

# Authentication (placeholder - extend as needed)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production
```

**For local Blob storage during development** (optional):

```bash
# Use local file storage instead
BLOB_STORE_TYPE=local
LOCAL_BLOB_PATH=./tmp/blob
```

### 2.4 Verify Setup

```bash
# Test database connection
npm run db:check

# Expected output:
# ✓ Database connected
# ✓ Schema version: 001
# ✓ Tables: illnesses, treatments, photos (3 total)
```

---

## 3. Docker Compose Workflow

### 3.1 Start & Stop Services

**Start all services**:
```bash
docker-compose up -d

# -d = detach (run in background)
# Includes: PostgreSQL, optional Redis/cache (future)
```

**View logs**:
```bash
docker-compose logs -f postgres

# -f = follow (stream output)
# Shows database startup messages
```

**Stop services**:
```bash
docker-compose down

# Containers stop, data persists in volumes
```

**Full reset** (delete all data):
```bash
docker-compose down -v

# -v = remove volumes
# Dangerous! Use only to reset development database
```

### 3.2 Running Commands Inside Container

```bash
# Execute SQL directly
docker-compose exec postgres psql -U dev -d health_story_dev -c "SELECT count(*) FROM illnesses;"

# Connect to interactive shell
docker-compose exec postgres psql -U dev -d health_story_dev

# View container logs
docker-compose logs postgres
```

### 3.3 Adding New Migrations

When you create a new migration file:

```bash
# Create migration file
cp db/migrations/001-initial-schema.sql db/migrations/002-add-field.sql
# Edit 002-add-field.sql with your SQL

# Option 1: Restart Docker (runs migrations on startup)
docker-compose restart postgres
sleep 5  # Wait for migrations to complete

# Option 2: Apply directly to running container
docker-compose exec postgres psql -U dev -d health_story_dev < ./db/migrations/002-add-field.sql

# Verify migration applied
docker-compose exec postgres psql -U dev -d health_story_dev -c "\dt"  # List tables
```

### 3.4 Troubleshooting Docker

**Container won't start**:
```bash
docker-compose logs postgres

# Check for port conflicts (5432 already in use)
lsof -i :5432  # List processes on port 5432
# Kill process: kill -9 <PID>
```

**Connection refused error**:
```bash
# Wait for health check to pass
docker-compose ps
# STATUS should show "Up (healthy)" not "Up"

# If still failing, restart
docker-compose restart postgres
sleep 10
npm run db:check
```

**Need to check data inside container**:
```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U dev -d health_story_dev

# List all tables
\dt

# Count illnesses
SELECT count(*) FROM illnesses;

# Exit
\q
```

---

## 3. Running Locally

**UPDATED: Start with Docker Compose**

```bash
# 1. Start database in background
docker-compose up -d

# 2. Verify database health (should show "Up (healthy)")
docker-compose ps

# 3. Verify migrations applied
npm run db:check

---

## 4. Running Locally

**Start the complete development environment**:

```bash
# 1. Start database in background (Docker Compose)
docker-compose up -d

# 2. Verify database health
docker-compose ps
# STATUS should show "Up (healthy)"

# 3. Verify migrations applied  
npm run db:check

# 4. Start Next.js development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

### 4.1 Complete Startup Checklist

```bash
# Terminal 1: Database
docker-compose up -d
docker-compose ps  # Verify "Up (healthy)"

# Terminal 2: Development server
npm run dev
# Wait for "▲ Next.js ready in XXms"

# Browser: Open http://localhost:3000
```

### 4.2 Development Server Features

- **Hot Reload**: Automatic refresh on file changes
- **API Route Debugging**: Check Chrome DevTools → Application → Network
- **Error Overlay**: Compilation errors show in browser overlay
- **TypeScript Checking**: Run `npm run type-check` in separate terminal

---

## 5. Development Workflow

### 5.1 Project Structure

```
Health Story/
├── app/                          # Next.js App Router (pages + layout)
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Dashboard / Home
│   ├── illnesses/
│   │   ├── page.tsx             # List illnesses
│   │   ├── [id]/page.tsx        # Detail view
│   │   └── new/page.tsx         # Create form
│   ├── api/                     # Backend API routes
│   │   ├── illnesses/
│   │   │   ├── route.ts         # GET /illnesses, POST /illnesses
│   │   │   └── [id]/
│   │   │       ├── route.ts     # GET/PUT/DELETE /illnesses/{id}
│   │   │       ├── photos/
│   │   │       │   └── route.ts # POST /illnesses/{id}/photos
│   │   │       └── treatments/
│   │   │           └── route.ts # POST /illnesses/{id}/treatments
│   │   └── health/
│   │       └── check.ts         # GET /api/health/check
│   └── components/              # Reusable React components
│       ├── IllnessForm.tsx
│       ├── PhotoUpload.tsx
│       └── TreatmentList.tsx
├── lib/
│   ├── db.ts                    # Database client & queries
│   ├── blob.ts                  # Vercel Blob storage client
│   ├── errors.ts                # Custom error types
│   └── auth.ts                  # Authentication helpers
├── tests/                       # Test suites (organized by type)
│   ├── unit/                    # Jest unit tests
│   ├── components/              # React Testing Library
│   ├── integration/             # API integration tests
│   └── e2e/                     # Playwright E2E tests
├── db/
│   └── migrations/
│       └── 001-initial-schema.sql
├── public/                      # Static assets (favicon, images)
├── .env.local                   # Local environment variables (git-ignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

### 5.2 Code Style & Patterns

**TypeScript**: Strict mode enabled
- Always type function parameters and return values
- Use interfaces for data structures (avoid `any`)

**React Components**:
- Functional components only (no class components)
- Use hooks for state management (useState, useEffect, useCallback)
- Add PropTypes or typed props interfaces

**CSS**: Tailwind utility classes
- Mobile-first: start with base styles for mobile, add responsive prefixes (sm:, md:, lg:)
- Use theme variables for colors (not hardcoded hex)

**File Naming**:
- PascalCase for React components: `IllnessForm.tsx`
- camelCase for utilities: `formatDate.ts`
- UPPERCASE for constants: `ALLOWED_PHOTO_TYPES.ts`

### 5.3 Creating a New Feature

**Example: Add "emergency note" to illnesses**

1. **Update database schema** (new migration):
```bash
cp db/migrations/001-initial-schema.sql db/migrations/002-add-emergency-note.sql
# Edit: ALTER TABLE illnesses ADD COLUMN emergency_note TEXT;
npm run db:migrate
```

2. **Update data model** (`lib/models/illness.ts`):
```typescript
export interface Illness {
  // ... existing fields
  emergency_note: string | null;
}
```

3. **Update API route** (`app/api/illnesses/[id]/route.ts`):
```typescript
// Include emergency_note in SELECT, allow in PUT request body
```

4. **Update UI component** (`app/components/IllnessForm.tsx`):
```typescript
// Add textarea for emergency_note, include in form submission
```

5. **Add tests** (all three test types):
```bash
# Unit test: lib/__tests__/models/illness.test.ts
# Component test: tests/components/IllnessForm.test.tsx
# E2E test: tests/e2e/illness-creation.spec.ts
```

6. **Verify with:** `npm run test:all` (runs all test suites)

---

## 6. Testing

### 6.1 Running Tests

**All tests** (recommended before commits):
```bash
npm run test:all

# Output summary:
# PASS  tests/unit/...
# PASS  tests/components/...
# PASS  tests/integration/...
# PASS  tests/e2e/...
# Test Suites: 4 passed, 4 total
# Tests: 120 passed, 120 total (example)
# Coverage: 82% (target: 80%+)
```

**Individual test suites**:
```bash
# Unit tests only
npm run test:unit

# Component tests only
npm run test:components

# Integration tests only
npm run test:integration

# E2E tests only (requires running dev server)
npm run test:e2e

# Watch mode (re-run on file changes)
npm run test:unit -- --watch
```

### 6.2 Test First Workflow

When implementing a feature:

1. **Write test first** (describe desired behavior)
```bash
# Create: tests/components/EmergencyNoteField.test.tsx
# Describe: "renders textarea with label and validation"
```

2. **Write minimal component** (make test pass)
```bash
# Create: app/components/EmergencyNoteField.tsx
# Implement: <textarea> with basic rendering
```

3. **Refactor** (improve code while keeping tests green)
```bash
# Add error handling, styling, accessibility
npm run test:components -- EmergencyNoteField.test.tsx
# Verify: test still passes
```

### 6.3 Test Coverage

Check coverage report:
```bash
npm run test:coverage

# Output: Generates /coverage/index.html
# Open in browser to see covered/uncovered lines
# Target: 80%+ coverage (constitution Principle II)
```

**Coverage by test type**:
- **Unit tests** (50%): Core business logic
- **Component tests** (20%): React UI interactions
- **Integration tests** (15%): API routes ↔ database
- **E2E tests** (15%): Full user workflows

---

## 7. Database Operations

### 7.1 Database Client

```typescript
// lib/db.ts - Singleton instance
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) =>
  pool.query(text, params);
```

### 6.2 Common Operations

**Create illness**:
```typescript
const result = await query(
  'INSERT INTO illnesses (user_id, name, date_started) VALUES ($1, $2, $3) RETURNING *',
  [userId, 'Common Cold', '2026-02-20']
);
```

**List illnesses for user**:
```typescript
const result = await query(
  'SELECT * FROM illnesses WHERE user_id = $1 ORDER BY date_started DESC',
  [userId]
);
```

**Update illness status**:
```typescript
await query(
  'UPDATE illnesses SET status = $1, date_ended = $2 WHERE id = $3',
  ['resolved', '2026-02-27', illnessId]
);
```

### 6.3 Migrations

Create new migration:
```bash
npm run db:create-migration "add_emergency_note"

# Generates: db/migrations/003-add-emergency-note.sql
# Edit the SQL file, then run:
npm run db:migrate
```

Rollback last migration:
```bash
npm run db:rollback
```

---

## 8. File Upload (Blob Storage)

### 8.1 Client-Side Upload

```typescript
// app/components/PhotoUpload.tsx
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', 'Symptom photo');

  const response = await fetch(
    `/api/illnesses/${illnessId}/photos`,
    {
      method: 'POST',
      body: formData,
    }
  );
  
  const photo = await response.json();
  console.log(`Photo uploaded: ${photo.file_url}`);
};
```

### 8.2 Server-Side Upload

```typescript
// app/api/illnesses/[id]/photos/route.ts
import { put } from '@vercel/blob';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Validate
  if (file.size > 25 * 1024 * 1024) {
    return Response.json(
      { error: 'File too large' },
      { status: 413 }
    );
  }

  // Upload to Vercel Blob
  const blob = await put(
    `photos/${userId}/${Date.now()}-${file.name}`,
    file,
    { access: 'public' }
  );

  // Save metadata to database
  const result = await query(
    'INSERT INTO photos (illness_id, file_id, file_url, mime_type, size_bytes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [illnessId, blob.pathname, blob.url, file.type, file.size]
  );

  return Response.json(result, { status: 201 });
}
```

---

## 9. Deployment to Vercel

### 9.1 Connect Repository

```bash
# Login to Vercel
vercel login

# Deploy (first time creates project)
vercel

# Follow prompts:
# ? Set up and deploy "Health Story"? y
# ? Which scope? (your-username)
# ? Link to existing project? n
# ? Project name? health-story
# ? Directory? . (current)
```

### 9.2 Environment Variables in Production

Set environment variables in Vercel Dashboard:

```
Settings → Environment Variables
Add:
DATABASE_URL=postgresql://...
BLOB_READ_WRITE_TOKEN=...
NEXTAUTH_URL=https://health-story.vercel.app
```

### 9.3 Automatic Deployments

- **Production** (`main` branch): Auto-deploy on push
- **Preview** (PR branch): Auto-deploy on PR creation
- **Manual**: `vercel --prod` to redeploy

---

## 10. Common Tasks

### 10.1 Debugging API Routes

```bash
# Add console.log statements
export async function POST(request) {
  console.log('Request received:', request.method);
  const formData = await request.formData();
  console.log('Form data:', Object.fromEntries(formData));
  // ...
}

# View logs:
# npm run dev (shows console.log output in terminal)
# Vercel Dashboard → Functions (for production logs)
```

### 10.2 Reset Development Database

```bash
# Drop and recreate
npm run db:reset

# This runs:
# 1. DROP DATABASE health_story_dev
# 2. CREATE DATABASE health_story_dev
# 3. Run all migrations from db/migrations/
```

### 10.3 Generate TypeScript Types from Database

```bash
npm run types:generate

# Generates: lib/database.types.ts
# Contains all table schemas as TypeScript interfaces
```

### 10.4 Check Performance

```bash
# Measure Next.js build size
npm run build

# Output shows:
# Route (pages) | Size | First Load JS
# ┌ ...
# └ ...
# overall bundle size < 200KB (target)
```

---

## 11. Troubleshooting

### Issue: "Database connection refused"

**Solution**:
```bash
# Check PostgreSQL is running
psql --version
psql -d health_story_dev -c "SELECT 1"

# If error: server closed the connection unexpectedly
# Restart: sudo systemctl restart postgresql  (Linux)
#          brew services restart postgresql    (Mac)
```

### Issue: "Blob upload fails with 403 Forbidden"

**Solution**:
```bash
# Check BLOB_READ_WRITE_TOKEN is set
echo $BLOB_READ_WRITE_TOKEN

# If empty, add to .env.local:
# BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Regenerate token in Vercel Dashboard:
# Settings → Tokens → Blob Storage
```

### Issue: "Tests timeout (>30s)"

**Solution**:
```bash
# Check if dev server is running
npm run dev  # in separate terminal

# Increase timeout for E2E tests
# tests/e2e/jest.config.js
# set timeout: 60000

# Run just that test
npm run test:e2e -- path/to/test.spec.ts
```

### Issue: "TypeScript errors after git pull"

**Solution**:
```bash
# Reinstall dependencies (schema might have changed)
npm install

# Regenerate types
npm run types:generate

# Check for breaking changes
npm run type-check
```

---

## 12. Next Steps

After completing setup:

1. **Run tests**: `npm run test:all` → Verify all 80%+ coverage
2. **Read specs**: Review `specs/001-illness-tracker/spec.md` → Understand requirements
3. **Explore API**: `specs/001-illness-tracker/contracts/illness-api.md` → Know endpoints
4. **Create feature branch**: `git checkout -b feature/US1-record-illness`
5. **Start coding**: Pick a task from `/speckit.tasks` (run after planning)

---

## 13. Key Commands Reference

```bash
# Development
npm run dev                 # Start dev server (http://localhost:3000)
npm run build              # Production build
npm start                  # Run production build

# Docker Compose (Database)
docker-compose up -d       # Start PostgreSQL in background
docker-compose down        # Stop PostgreSQL
docker-compose down -v     # Stop + delete all data (full reset)
docker-compose ps          # Check service status
docker-compose logs -f postgres  # View logs

# Testing (Principle II: 80%+ coverage)
npm run test:all           # All test suites
npm run test:unit          # Unit tests only
npm run test:components    # React component tests
npm run test:integration   # API integration tests
npm run test:e2e           # End-to-end tests
npm run test:coverage      # Coverage report

# Database
npm run db:check           # Verify connection
npm run db:migrate         # Run pending migrations
npm run db:reset           # Drop & recreate with migrations
npm run db:create-migration <name> # New migration file

# Quality
npm run type-check         # TypeScript errors
npm run lint               # ESLint + Prettier
npm run format             # Auto-fix formatting

# Deployment
vercel                     # Deploy to Vercel (preview)
vercel --prod              # Deploy to production

# Utilities
npm run types:generate     # Generate types from DB schema
npm run health             # Full system health check
```

---

## 14. Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Vercel Blob**: https://vercel.com/docs/storage/vercel-blob
- **Docker**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Project Constitution**: [specs/001-illness-tracker/constitution.md](constitution.md)
- **Implementation Plan**: [specs/001-illness-tracker/plan.md](plan.md)

**Questions?** Check existing tests in `/tests/` for code examples before asking other developers.
