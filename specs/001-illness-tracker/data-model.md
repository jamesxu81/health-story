# Data Model: Health Records & Illness Tracker

**Date**: 2026-03-08  
**Feature**: [Health Records & Illness Tracker](spec.md)  
**Status**: Phase 1 Design  
**Technology**: PostgreSQL, Next.js/TypeScript

---

## Entity Relationship Diagram

```text
┌─────────────┐
│    User     │ (authenticated context, auth handler)
└─────────────┘
      │
      │ (1:N relationship)
      ▼
┌─────────────────────┐       ┌───────────────┐
│ Illness Record      │───────▶│  Symptom      │
│ (core data model)   │  (1:N) │  (qualities)  │
└─────────────────────┘       └───────────────┘
      │
      ├─────────(1:N)──────────┬──────────────────────┐
      │                        │                      │
      ▼                        ▼                      ▼
┌─────────────┐         ┌─────────────┐      ┌─────────────┐
│ Treatment   │         │ Photo       │      │ History     │
│ (cures)     │         │ (evidence)  │      │ (timeline)  │
└─────────────┘         └─────────────┘      └─────────────┘
```

---

## Entity Definitions

### 1. Illness (Core entity)

**Purpose**: Record a single illness episode with symptoms and cause.

**Repository Mapping**:
- Table: `illnesses`
- TypeScript: `src/types/illness.ts` and `src/lib/db/schema.ts`

**Fields**:

| Field | Type | Constraints | Example | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | `550e8400-e29b-41d4-a716-446655440000` | Unique identifier |
| `user_id` | UUID | FOREIGN KEY (user table) | `{authenticated_user_id}` | Isolates data per user |
| `name` | VARCHAR(255) | NOT NULL | `"Common Cold"`, `"Flu"`, `"Headache"` | Illness type/name |
| `date_started` | DATE | NOT NULL | `2026-03-01` | Date illness began (past or today, not future) |
| `date_ended` | DATE | NULLABLE | `2026-03-05` | Date illness resolved (user-set, ≥ date_started) |
| `status` | ENUM | NOT NULL | `"active"` or `"resolved"` | Current status (derived from date_ended) |
| `symptoms` | JSON (array) | NOT NULL | See Symptom entity | Emergency JSONB column for symptoms |
| `cause` | TEXT | NULLABLE | `"Exposed at work"`, `"Ate bad food"` | What caused the illness |
| `notes` | TEXT | NULLABLE | `"Used honey for cough, really helped"` | Additional notes |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | `2026-03-08T10:30:00Z` | Record creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | `2026-03-08T14:45:00Z` | Last update time |

**Indexes**:
- `(user_id, date_started DESC)` - Fast filtering for history/timeline
- `(user_id, status)` - Show active illnesses first
- `(name)` - Search by illness name (if implementing full-text later)

**Validation Rules**:
- `name`: Required, 1-255 characters, trimmed whitespace
- `date_started`: Required, cannot be future date, must be valid ISO date
- `date_ended`: Optional, must be ≥ `date_started` if provided, cannot be future date
- `symptoms`: Array of objects (see Symptom entity), min 0, max 50 items
- `cause`: Optional, 0-1000 characters
- `notes`: Optional, 0-5000 characters
- `user_id`: Always authenticated user (enforced in middleware)

**Sample Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-123",
  "name": "Common Cold",
  "date_started": "2026-02-20",
  "date_ended": "2026-02-27",
  "status": "resolved",
  "symptoms": [
    {
      "name": "Cough",
      "severity": "moderate",
      "duration": "4 days"
    },
    {
      "name": "Sore Throat",
      "severity": "mild",
      "duration": "2 days"
    }
  ],
  "cause": "Exposed at crowded public transport",
  "notes": "Used honey lozenges and rest, symptoms subsided by day 5",
  "created_at": "2026-02-20T09:00:00Z",
  "updated_at": "2026-02-27T14:00:00Z"
}
```

**TypeScript Type**:

```typescript
interface Illness {
  id: string; // UUID
  user_id: string; // UUID of authenticated user
  name: string; // 1-255 chars
  date_started: Date;
  date_ended: Date | null;
  status: "active" | "resolved";
  symptoms: Symptom[];
  cause: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
```

---

### 2. Symptom (Nested in Illness.symptoms JSON)

**Purpose**: Describe a symptom of an illness (stored as JSON array in Illness record).

**Repository Mapping**:
- Storage: JSONB column in `illnesses.symptoms` (denormalized for performance)
- TypeScript: `src/types/illness.ts`

**Fields**:

| Field | Type | Constraints | Example | Description |
|-------|------|-------------|---------|-------------|
| `name` | VARCHAR(100) | NOT NULL | `"Cough"`, `"Fever"`, `"Fatigue"` | Symptom name |
| `severity` | ENUM | NOT NULL | `"mild"`, `"moderate"`, `"severe"` | Intensity (optional but recommended) |
| `duration` | VARCHAR(100) | NULLABLE | `"3 days"`, `"started on day 2"` | How long symptom lasted |

**Validation Rules**:
- `name`: Required, 1-100 characters, non-empty
- `severity`: One of `["mild", "moderate", "severe"]`
- `duration`: Optional, 1-100 characters description

**Sample Data** (within Illness):

```json
{
  "symptoms": [
    {
      "name": "Cough",
      "severity": "moderate",
      "duration": "3 days"
    },
    {
      "name": "Sore Throat",
      "severity": "mild",
      "duration": "2 days"
    }
  ]
}
```

**TypeScript Type**:

```typescript
interface Symptom {
  name: string; // 1-100 chars
  severity: "mild" | "moderate" | "severe";
  duration: string | null; // 1-100 chars
}
```

**Rationale for JSONB Storage**:
- Symptoms are tightly coupled to an Illness (always accessed together)
- No need for separate relational queries
- Simplifies data loading (single query vs JOIN)
- Flexible array length (0-50 symptoms)
- Can be migrated to relational table later without API changes

---

### 3. Treatment (Cure record linked to Illness)

**Purpose**: Track treatments/cures used for an illness and their effectiveness.

**Repository Mapping**:
- Table: `treatments`
- TypeScript: `src/types/treatment.ts` and `src/lib/db/schema.ts`

**Fields**:

| Field | Type | Constraints | Example | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | | Unique identifier |
| `illness_id` | UUID | FOREIGN KEY → illnesses(id) | | Links to Illness |
| `name` | VARCHAR(255) | NOT NULL | `"Paracetamol 500mg"`, `"Rest"`, `"Honey"` | Treatment name |
| `type` | ENUM | NOT NULL | `"medicine"`, `"home_remedy"`, `"doctor_recommendation"` | Treatment category |
| `effectiveness` | ENUM | NOT NULL | `"effective"`, `"ineffective"`, `"unknown"` | Did it work? |
| `started_at` | TIMESTAMP | NOT NULL | `2026-02-20T10:00:00Z` | When was treatment started |
| `ended_at` | TIMESTAMP | NULLABLE | `2026-02-22T18:00:00Z` | When did treatment stop |
| `notes` | TEXT | NULLABLE | `"Took every 4 hours, reduced fever significantly"` | Additional details |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | | Record creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | | Last update time |

**Indexes**:
- `(illness_id)` - Retrieve treatments for an illness
- `(effectiveness)` - Filter by effective treatments

**Validation Rules**:
- `name`: Required, 1-255 characters
- `type`: One of `["medicine", "home_remedy", "doctor_recommendation"]`
- `effectiveness`: One of `["effective", "ineffective", "unknown"]`
- `started_at`: Required, valid timestamp
- `ended_at`: Optional, must be ≥ `started_at` if provided
- `notes`: Optional, 0-2000 characters

**Sample Data**:

```json
{
  "id": "660e9500-e29b-41d4-a716-446655441111",
  "illness_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Paracetamol 500mg Every 4 Hours",
  "type": "medicine",
  "effectiveness": "effective",
  "started_at": "2026-02-20T10:00:00Z",
  "ended_at": "2026-02-22T18:00:00Z",
  "notes": "Reduced fever and headache within 2 hours",
  "created_at": "2026-02-20T10:15:00Z",
  "updated_at": "2026-02-22T18:00:00Z"
}
```

**TypeScript Type**:

```typescript
interface Treatment {
  id: string; // UUID
  illness_id: string; // UUID
  name: string; // 1-255 chars
  type: "medicine" | "home_remedy" | "doctor_recommendation";
  effectiveness: "effective" | "ineffective" | "unknown";
  started_at: Date;
  ended_at: Date | null;
  notes: string | null; // 0-2000 chars
  created_at: Date;
  updated_at: Date;
}
```

---

### 4. Photo (Evidence attachment for Illness)

**Purpose**: Store reference to photos attached to illness records (rash, test results, etc.).

**Repository Mapping**:
- Table: `photos`
- File Storage: Vercel Blob or AWS S3 (metadata in DB, binary in blob storage)
- TypeScript: `src/types/photo.ts` and `src/lib/db/schema.ts`

**Fields**:

| Field | Type | Constraints | Example | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | | Unique identifier |
| `illness_id` | UUID | FOREIGN KEY → illnesses(id) | | Links to Illness |
| `file_id` | VARCHAR(500) | NOT NULL | `"vercel-blob://..."`  or `"s3://bucket/key"` | Reference to blob storage |
| `description` | TEXT | NULLABLE | `"Rash on left arm day 3"`, `"Blood test results"` | Photo description |
| `uploaded_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | `2026-02-21T14:30:00Z` | Upload timestamp |
| `size_bytes` | INTEGER | NOT NULL | `5242880` | File size in bytes (max 26,214,400 = 25MB) |
| `mime_type` | VARCHAR(50) | NOT NULL | `"image/jpeg"`, `"image/png"` | File MIME type |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | | Metadata creation time |

**Indexes**:
- `(illness_id)` - Retrieve all photos for an illness
- `(uploaded_at DESC)` - Show newest photos first

**Validation Rules**:
- `file_id`: Required, valid storage reference
- `mime_type`: One of `["image/jpeg", "image/png", "image/gif", "image/webp"]`
- `size_bytes`: Required, must be ≤ 26,214,400 (25MB)
- `description`: Optional, 0-500 characters
- `illness_id`: Must reference existing Illness record (FK constraint)

**Sample Data**:

```json
{
  "id": "770e9500-e29b-41d4-a716-446655442222",
  "illness_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_id": "vercel-blob://abc123def456",
  "description": "Rash on left arm, appeared on day 3",
  "uploaded_at": "2026-02-21T14:30:00Z",
  "size_bytes": 3145728,
  "mime_type": "image/jpeg",
  "created_at": "2026-02-21T14:30:00Z"
}
```

**TypeScript Type**:

```typescript
interface Photo {
  id: string; // UUID
  illness_id: string; // UUID
  file_id: string; // Blob storage reference
  description: string | null; // 0-500 chars
  uploaded_at: Date;
  size_bytes: number; // ≤ 26214400
  mime_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  created_at: Date;
}
```

---

### 5. Derived: IllnessTimeline (Read-only view)

**Purpose**: Chronological view of all illnesses for user (used in history view).

**Mapping**: SQL VIEW or computed in-memory from Illnesses query

**Composition**:

```typescript
interface IllnessTimeline {
  illnesses: (Illness & {
    photo_count: number;
    treatment_count: number;
    recovery_days: number | null; // date_ended - date_started if both set
  })[];
  // Sorted by date_started DESC (most recent first)
  // Includes aggregated metadata for display
}
```

**Sample Query Result**:

```json
{
  "illnesses": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Common Cold",
      "date_started": "2026-02-20",
      "date_ended": "2026-02-27",
      "status": "resolved",
      "symptoms": [
        {
          "name": "Cough",
          "severity": "moderate",
          "duration": "4 days"
        }
      ],
      "cause": "Public transport",
      "photo_count": 1,
      "treatment_count": 3,
      "recovery_days": 7
    }
  ]
}
```

**Not Stored in DB**: Computed from queries with aggregations. No separate table needed.

---

## Database Schema (SQL)

### Migration: Create Base Tables

```sql
-- Create ENUM types
CREATE TYPE illness_status AS ENUM ('active', 'resolved');
CREATE TYPE treatment_type AS ENUM ('medicine', 'home_remedy', 'doctor_recommendation');
CREATE TYPE treatment_effectiveness AS ENUM ('effective', 'ineffective', 'unknown');
CREATE TYPE symptom_severity AS ENUM ('mild', 'moderate', 'severe');
CREATE TYPE mime_type AS ENUM ('image/jpeg', 'image/png', 'image/gif', 'image/webp');

-- Illnesses table
CREATE TABLE illnesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  date_started DATE NOT NULL,
  date_ended DATE,
  status illness_status NOT NULL DEFAULT 'active',
  symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
  cause TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT date_order CHECK (date_ended IS NULL OR date_ended >= date_started),
  CONSTRAINT not_future_start CHECK (date_started <= CURRENT_DATE),
  CONSTRAINT not_future_end CHECK (date_ended IS NULL OR date_ended <= CURRENT_DATE)
);

CREATE INDEX idx_illnesses_user_date ON illnesses(user_id, date_started DESC);
CREATE INDEX idx_illnesses_user_status ON illnesses(user_id, status);

-- Treatments table
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  illness_id UUID NOT NULL REFERENCES illnesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type treatment_type NOT NULL,
  effectiveness treatment_effectiveness NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX idx_treatments_illness ON treatments(illness_id);
CREATE INDEX idx_treatments_effectiveness ON treatments(effectiveness);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  illness_id UUID NOT NULL REFERENCES illnesses(id) ON DELETE CASCADE,
  file_id VARCHAR(500) NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  size_bytes INTEGER NOT NULL,
  mime_type mime_type NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT size_limit CHECK (size_bytes <= 26214400)
);

CREATE INDEX idx_photos_illness ON photos(illness_id);
CREATE INDEX idx_photos_date ON photos(uploaded_at DESC);
```

### Subsequent Migrations (as needed)

- Add columns for sync metadata (last_synced_at, sync_version)
- Add audit logging table (tracks changes for regression analysis)
- Add user preferences table (notification settings, UI preferences)

---

## Relationships & Constraints

### Cascading Deletes

- **Illness deleted** → All Treatments and Photos deleted (FK CASCADE)
  - Rationale: Orphaned treatments/photos without illness are meaningless

### Data Integrity Rules

```
┌─────────────────────────────────────────────┐
│ Illness.date_started ≤ Illness.date_ended   │
│ (if date_ended is not NULL)                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Illness.date_started ≤ TODAY  (FK enforced  │
│ (not future,; user can set   by PG CHECK)  │
│ retrospectively)                            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Treatment.started_at ≤ Treatment.ended_at   │
│ (if ended_at is not NULL)                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Photo.size_bytes ≤ 25 MB                    │
│ (enforced by Photo.size_limit CHECK)        │
└─────────────────────────────────────────────┘
```

---

## Example Queries

### Get All Illnesses for User (Timeline View)

```sql
SELECT 
  i.*,
  COUNT(DISTINCT t.id) as treatment_count,
  COUNT(DISTINCT p.id) as photo_count,
  EXTRACT(DAY FROM (i.date_ended - i.date_started))::INTEGER as recovery_days
FROM illnesses i
LEFT JOIN treatments t ON i.id = t.illness_id
LEFT JOIN photos p ON i.id = p.illness_id
WHERE i.user_id = $1
GROUP BY i.id
ORDER BY i.date_started DESC;
```

### Search Illnesses by Name (Exact Match - FR-009)

```sql
SELECT * FROM illnesses
WHERE user_id = $1
  AND name ILIKE $2  -- Case-insensitive, partial matching
ORDER BY date_started DESC;
```

### Get Illness Details with Treatments and Photos

```sql
SELECT 
  i.*,
  json_agg(
    json_build_object(
      'id', t.id,
      'name', t.name,
      'type', t.type,
      'effectiveness', t.effectiveness,
      'started_at', t.started_at,
      'ended_at', t.ended_at
    )
  ) as treatments,
  json_agg(
    json_build_object(
      'id', p.id,
      'description', p.description,
      'file_id', p.file_id,
      'size_bytes', p.size_bytes
    )
  ) as photos
FROM illnesses i
LEFT JOIN treatments t ON i.id = t.illness_id
LEFT JOIN photos p ON i.id = p.illness_id
WHERE i.id = $1 AND i.user_id = $2
GROUP BY i.id;
```

### Trend Analysis: Illness Frequency

```sql
SELECT 
  name,
  COUNT(*) as occurrence_count,
  AVG(EXTRACT(DAY FROM (date_ended - date_started)))::DECIMAL as avg_recovery_days
FROM illnesses
WHERE user_id = $1 AND status = 'resolved'
GROUP BY name
ORDER BY occurrence_count DESC;
```

---

## Migration & Version Control

**Migration Files** (in `src/lib/db/migrations/`):
- `001_create_base_schema.sql` - Initial tables and ENUMs
- `002_add_sync_metadata.sql` - (future) Sync columns for multi-device
- `003_create_audit_log.sql` - (future) Change tracking for regressions

**Approach**: SQL migrations tracked in git, run before app startup (Vercel deployment hooks)

---

## Notes for Implementation

1. **TypeScript Schema Generation**: Use `prisma` or write custom code generator to keep `src/types/` in sync with SQL schema
2. **Seed Data**: Include `seeds/demo-data.sql` with sample illnesses for testing/demo
3. **Audit Logging**: Future table to track all changes (important for Principle III "Regression Prevention")
4. **Soft Deletes**: Consider tracking deleted records (update_ts, deleted_at) for GDPR compliance instead of hard delete
5. **Time Zone Handling**: All timestamps in UTC; convert to user's local time zone in frontend

---

## Related Documents

- **spec.md**: User requirements and user stories
- **research.md**: Technology selection rationale
- **contracts/**: API specifications for endpoint parameters
- **quickstart.md**: Database setup instructions for developers
