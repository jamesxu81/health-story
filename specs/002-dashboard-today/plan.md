# Implementation Plan: Dashboard & Today View

**Branch**: `002-dashboard-today` | **Date**: 2026-03-19 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/002-dashboard-today/spec.md`

## Summary

Replace the current root-level redirect (`/` → `/record`) with a server-rendered Dashboard page that shows active illnesses, a recent-activity feed, quick-action buttons, and summary stats. No new database tables are needed — all data is derived from existing `illnesses` and `treatments` tables via a single new API endpoint (`GET /api/dashboard`) and a handful of new DB query functions. The page follows the established warm + calm (sand/teal) design system.

## Technical Context

**Language/Version**: TypeScript 5.x / ECMAScript 2022+  
**Frontend Framework**: React 18 + Next.js 14 (App Router)  
**Backend**: Next.js API Routes, Node.js runtime  
**Primary Dependencies**: React, Next.js, Tailwind CSS, Zod (all already installed)  
**Storage**: PostgreSQL (existing, via `pg` pool in `src/lib/db.ts`)  
**Testing**: Jest + React Testing Library (unit/component), Playwright (E2E)  
**Target Platform**: Web — mobile-first responsive (320px–1440px)  
**Project Type**: Full-stack web application  
**Performance Goals**: LCP < 1.5s, API response < 500ms  
**New Dependencies**: None required

## What Already Exists

These existing pieces will be **reused**, not rebuilt:

| Asset | Location | Reuse |
|-------|----------|-------|
| DB pool + helpers | `src/lib/db.ts` | `query`, `queryOne`, `queryAll` |
| `getIllnessesByUser` | `src/lib/db/queries/illness.ts` | Fetch active illnesses (filter `status=active`) |
| `getIllnessStats` | `src/lib/db/queries/history.ts` | Already computes total/active/resolved counts — needs extension for avg recovery + most common |
| Auth helper | `src/lib/auth.ts` | `extractUserContext` for user_id |
| Type definitions | `src/types/illness.ts`, `treatment.ts` | `Illness`, `IllnessWithCounts`, `Treatment` |
| Warm + calm UI | `app/(dashboard)/layout.tsx` | Nav bar, color scheme, layout shell |
| Illness card | `src/components/Cards/IllnessCard.tsx` | Adapted for dashboard active-illness cards |

## Architecture Decisions

### 1. Single API endpoint vs. multiple

**Decision**: Single `GET /api/dashboard` endpoint that returns all dashboard data in one response.

**Rationale**: The dashboard needs 3–4 related data sets (active illnesses, activity feed, stats). Making separate requests would create waterfall loading and require client-side assembly. A single endpoint keeps the frontend simple — one `fetch`, one loading state.

**Response shape**:
```typescript
interface DashboardResponse {
  active_illnesses: IllnessWithCounts[];
  recent_activity: ActivityEvent[];
  stats: {
    total_illnesses: number;
    active_count: number;
    resolved_count: number;
    this_month_count: number;
    avg_recovery_days: number | null;
    most_common_illness: { name: string; count: number } | null;
  };
}

interface ActivityEvent {
  type: 'illness_created' | 'illness_resolved' | 'treatment_added';
  title: string;
  illness_id: string;
  illness_name: string;
  timestamp: string; // ISO
}
```

### 2. Server Component vs. Client Component

**Decision**: Dashboard page (`app/(dashboard)/page.tsx`) is a **Server Component** that fetches data via a direct DB call (not an API fetch), then passes props to Client Components for interactivity.

**Rationale**: Faster initial paint (no client-side fetch waterfall), better SEO, and the dashboard is primarily read-only. Interactive pieces (quick-action buttons, "mark resolved" nudge) are isolated Client Components.

### 3. Activity feed data source

**Decision**: Derive activity events from existing table columns at query time — no new `events` table.

**Rationale**: Illness creation = `illnesses.created_at`, illness resolved = `illnesses.updated_at WHERE date_ended IS NOT NULL`, treatment added = `treatments.created_at`. A UNION query assembles the feed. This avoids schema changes and keeps the feature self-contained.

### 4. Page routing

**Decision**: Convert `app/(dashboard)/page.tsx` into the dashboard (it doesn't exist yet — the `(dashboard)` group has no `page.tsx`). Update `app/page.tsx` to redirect to the dashboard group root.

**Rationale**: The `(dashboard)` layout already wraps `/record` and `/history`. Adding a `page.tsx` at the group root means `/` renders inside the same nav shell automatically.

## Project Structure (new/modified files)

```text
# New files
app/(dashboard)/page.tsx                          # Dashboard page (Server Component)
src/components/Dashboard/ActiveIllnessCards.tsx    # Active illness card grid
src/components/Dashboard/ActivityFeed.tsx          # Recent activity list
src/components/Dashboard/QuickActions.tsx          # Quick-action buttons
src/components/Dashboard/StatsSnapshot.tsx         # Summary stats bar
src/components/Dashboard/EmptyState.tsx            # "Everyone's feeling good!" state
src/lib/db/queries/dashboard.ts                    # Dashboard-specific DB queries
app/api/dashboard/route.ts                         # GET /api/dashboard endpoint
tests/unit/lib/db/queries/dashboard.test.ts        # Unit tests for dashboard queries
tests/unit/components/Dashboard/                   # Component unit tests
tests/e2e/05-dashboard.e2e.ts                      # E2E tests for dashboard

# Modified files
app/page.tsx                                       # Change redirect from /record → /
app/(dashboard)/layout.tsx                         # Add "Home" nav link for dashboard
```

## Implementation Phases

### Phase 1: Data Layer (backend)

**Goal**: Build the DB queries and API endpoint that power the dashboard.

#### 1a. Dashboard DB queries (`src/lib/db/queries/dashboard.ts`)

New query functions:

- **`getActiveIllnesses(userId)`** — Fetch all illnesses with `status = 'active'`, include symptom count, treatment count, days elapsed. Reuses the same JOIN pattern as `getIllnessesByUser` but without pagination and filtered to active only.

- **`getRecentActivity(userId, limit = 10)`** — UNION query across three sources:
  ```sql
  SELECT 'illness_created' as type, name as title, id as illness_id, name as illness_name, created_at as timestamp
  FROM illnesses WHERE user_id = $1
  UNION ALL
  SELECT 'illness_resolved', name, id, name, updated_at
  FROM illnesses WHERE user_id = $1 AND date_ended IS NOT NULL
  UNION ALL
  SELECT 'treatment_added', t.name, i.id, i.name, t.created_at
  FROM treatments t JOIN illnesses i ON t.illness_id = i.id WHERE i.user_id = $1
  ORDER BY timestamp DESC LIMIT $2
  ```

- **`getDashboardStats(userId)`** — Extends existing `getIllnessStats` with:
  - `this_month_count` (illnesses where `date_started` in current month)
  - `avg_recovery_days` (average of `date_ended - date_started` for resolved illnesses)
  - `most_common_illness` (name + count via `GROUP BY name ORDER BY count DESC LIMIT 1`)

#### 1b. API route (`app/api/dashboard/route.ts`)

- `GET /api/dashboard` — Calls all three query functions in parallel (`Promise.all`), returns combined `DashboardResponse`.
- Uses `extractUserContext` for auth.
- Error handling via existing `errorToResponse` pattern.

#### 1c. Unit tests for queries

- Test `getActiveIllnesses` with 0, 1, and multiple active illnesses
- Test `getRecentActivity` returns events in correct order, respects limit
- Test `getDashboardStats` computes correct averages and most-common name

---

### Phase 2: UI Components (frontend)

**Goal**: Build the five presentational components that compose the dashboard.

#### 2a. `EmptyState` — shown when 0 active illnesses and 0 total records
- Friendly illustration (SVG or emoji-based), warm copy, link to "Add a sick day"

#### 2b. `ActiveIllnessCards` — grid of active illness cards
- Props: `illnesses: IllnessWithCounts[]`
- Each card: illness name, start date, symptom count, days elapsed badge
- "Still going?" nudge on cards > 7 days old
- Responsive: 1 column on mobile, 2 on ≥768px
- Links to `/history/{id}` for detail

#### 2c. `ActivityFeed` — recent event list
- Props: `events: ActivityEvent[]`, `hasMore: boolean`
- Each row: icon by type, title, relative timestamp
- "View all in timeline" link if `hasMore`
- Empty state: "All quiet lately — that's a good sign!"

#### 2d. `QuickActions` — action buttons
- Props: `activeIllnesses: IllnessWithCounts[]`
- Always shows: "Add a sick day" → `/record`, "View timeline" → `/history`
- Conditional: "Add treatment for {name}" → `/history/{id}` (for each active illness, capped at 3)

#### 2e. `StatsSnapshot` — stats bar
- Props: `stats: DashboardStats`
- Shows 4 stat tiles: total, this month, avg recovery, most common
- Hidden when `total_illnesses === 0`

#### 2f. Component unit tests
- Render each component with mock data, verify content and conditional rendering
- Test empty states

---

### Phase 3: Dashboard Page Assembly

**Goal**: Wire everything together in the page and update navigation.

#### 3a. `app/(dashboard)/page.tsx` (Server Component)
- Fetches dashboard data by calling DB queries directly (no API fetch needed in Server Components)
- Passes data as props to the Client Components
- Skeleton/loading state via `loading.tsx` if desired

#### 3b. Update `app/page.tsx`
- Change redirect from `/record` to root (`/`) which now renders the dashboard
- Since `app/(dashboard)/page.tsx` IS the root (`/`) in the `(dashboard)` route group, `app/page.tsx` may just need to be removed or kept as a simple redirect

#### 3c. Update `app/(dashboard)/layout.tsx`
- Add "Home" link to the nav bar that highlights when `pathname === '/'`

#### 3d. Integration test
- Verify the full page renders with real API data (or mocked DB)

---

### Phase 4: E2E Tests + Polish

**Goal**: Playwright tests covering all acceptance scenarios, plus responsive polish.

#### 4a. `tests/e2e/05-dashboard.e2e.ts`
- **Test 1**: Dashboard shows active illness count and cards correctly
- **Test 2**: Dashboard shows friendly empty state when no records exist
- **Test 3**: Activity feed shows events in correct order with relative timestamps
- **Test 4**: Quick-action buttons navigate to correct pages
- **Test 5**: Stats section shows correct computed values
- **Test 6**: "Still going?" nudge appears on illness > 7 days old
- **Test 7**: Responsive layout: single column at 375px, two-column at 1024px

#### 4b. Regression check
- Run existing test suites to verify nothing broke
- Verify `/record` and `/history` still work as before

#### 4c. Visual polish
- Ensure consistent spacing, color usage, typography with existing pages
- Test on mobile viewport (375px Safari)

## Task Estimate

| Phase | Tasks | Estimated Effort |
|-------|-------|-----------------|
| Phase 1: Data layer | 3 files (queries, API route, tests) | Small |
| Phase 2: UI components | 5 components + tests | Medium |
| Phase 3: Page assembly | 3 files (page, layout, redirect) | Small |
| Phase 4: E2E + polish | 1 E2E file, regression check | Small–Medium |
| **Total** | **~12–15 files** | **Medium** |

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| UNION query for activity feed is slow on large datasets | Low (indexed on user_id + created_at) | Add `LIMIT` and appropriate indexes; monitor query plan |
| "Most common illness" returns ties (multiple names with same count) | Low | Take first alphabetically; show only one |
| Server Component data fetching adds cold-start latency | Medium | Use `unstable_cache` or ISR if needed; monitor LCP |
| Nav changes break existing E2E tests | Medium | Update E2E selectors if nav order changes |

## Next Steps

Phase 2: `/speckit.tasks` — Generate granular, ordered task list from this plan for implementation.
