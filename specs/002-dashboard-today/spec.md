# Feature Specification: Dashboard & Today View

**Feature Branch**: `002-dashboard-today`  
**Created**: 2026-03-19  
**Status**: Draft  
**Input**: User description: "Dashboard and Today view — a landing page showing active illnesses, recent activity, quick-add buttons, and a family-friendly overview of health status"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — At-a-Glance Family Health Summary (Priority: P1)

A parent or family member opens Health Story and immediately sees whether anyone in the family is currently sick, how many illnesses are active, and a warm visual summary — no clicking required.

**Why this priority**: The dashboard is the single entry point for the app. Without a meaningful landing page, users are dumped onto a form ("Add a sick day") every time they open the app, even when they just want to check status. This story delivers the most value by answering the #1 question: *"Is anyone sick right now?"*

**Independent Test**: Can be fully tested by creating a mix of active and resolved illnesses, then verifying the dashboard renders the correct counts and cards. Delivers immediate value as a read-only overview.

**Acceptance Scenarios**:

1. **Given** user has 2 active illnesses and 5 resolved, **When** they open the dashboard (`/`), **Then** the page shows "2 active sick days" prominently and lists the active illness cards with name, start date, symptom count, and days elapsed
2. **Given** user has 0 active illnesses, **When** they open the dashboard, **Then** the page shows a friendly "Everyone's feeling good!" empty state with an illustration or icon
3. **Given** an active illness was recorded more than 7 days ago, **When** user views the dashboard, **Then** that illness card shows a gentle nudge: "Still going? You can mark it resolved"
4. **Given** user is on any screen size (320px–1440px), **When** they view the dashboard, **Then** the layout adapts gracefully — single-column on mobile, two-column on desktop

---

### User Story 2 — Recent Activity Feed (Priority: P1)

The user sees a chronological feed of recent health events — new illnesses recorded, treatments added, illnesses resolved — so they understand what changed recently without navigating to individual records.

**Why this priority**: Provides context and a sense of continuity. Especially valuable for families where one parent records an illness and the other opens the app later to check. Pairs tightly with Story 1 to form the complete "Today view."

**Independent Test**: Can be tested by creating several illnesses and treatments on known dates, then verifying the activity feed shows the correct items in reverse chronological order.

**Acceptance Scenarios**:

1. **Given** the user created an illness yesterday and added a treatment today, **When** they view the dashboard, **Then** the activity feed shows both events with relative timestamps ("today", "yesterday")
2. **Given** the user resolved an illness 3 days ago, **When** they view the activity feed, **Then** a "marked as resolved" event appears with the illness name
3. **Given** no activity in the last 30 days, **When** user views the feed, **Then** a friendly empty state says "All quiet lately — that's a good sign!" with a link to timeline
4. **Given** there are 20+ events, **When** user views the dashboard, **Then** only the 10 most recent events display, with a "View all in timeline" link

---

### User Story 3 — Quick-Action Buttons (Priority: P2)

The dashboard provides one-tap shortcuts for the most common actions: "Add a sick day," "View timeline," and (if active illnesses exist) "Add treatment" for a specific active illness.

**Why this priority**: Reduces friction for the most frequent tasks. Without quick actions the dashboard is view-only and the user must navigate away for every interaction. This story makes the dashboard actionable, but it's a navigation enhancement rather than new data — hence P2.

**Independent Test**: Can be tested by verifying the quick-action buttons are present, route to the correct pages, and conditionally show the "Add treatment" shortcut only when active illnesses exist.

**Acceptance Scenarios**:

1. **Given** user lands on the dashboard, **When** they see the quick-action area, **Then** "Add a sick day" and "View timeline" buttons are always visible
2. **Given** user has 1 active illness ("Cold"), **When** they see the quick-action area, **Then** an "Add treatment for Cold" button appears linking to the treatment form for that illness
3. **Given** user has 0 active illnesses, **When** they see the quick-action area, **Then** no treatment shortcut is shown (only "Add a sick day" and "View timeline")
4. **Given** user taps "Add a sick day," **When** they finish recording, **Then** they are returned to the dashboard (not the old /record redirect)

---

### User Story 4 — Stats Snapshot (Priority: P3)

The dashboard shows lightweight summary statistics: total illnesses recorded, total this month, average recovery days, and most common illness name. This gives the user a quick health "pulse."

**Why this priority**: Nice-to-have insight that enriches the dashboard but is not essential for initial launch. The data already exists; this story is about surfacing aggregated numbers. Lower effort, lower priority.

**Independent Test**: Can be tested by seeding known illness data and verifying the computed stats match expected values (counts, averages, most-frequent name).

**Acceptance Scenarios**:

1. **Given** user has 12 resolved illnesses with known recovery days, **When** they view the stats section, **Then** "Average recovery: X days" is shown correctly
2. **Given** user has 3 illnesses named "Cold" and 1 named "Flu," **When** they view stats, **Then** "Most common: Cold (3 times)" appears
3. **Given** user has 0 illness records, **When** they view the stats section, **Then** stats section is hidden or shows "Record your first sick day to see stats here"
4. **Given** user recorded 2 illnesses this month, **When** they view stats, **Then** "This month: 2 sick days" is shown

---

### Edge Cases

- What happens when API call to fetch dashboard data fails? → Show friendly error with retry button, not a blank page
- What happens when user has hundreds of active illnesses (unlikely but possible)? → Cap the active-illness card list at 10 with "and X more…" overflow
- How does the dashboard handle an illness with `date_started` in the future (data entry mistake)? → Display it with a subtle "Starts in the future" badge rather than hiding it
- What happens when `date_ended` is before `date_started` (invalid data)? → Ignore recovery-day calculation for that record; show "—" instead of negative number
- How does the page behave when JavaScript is still loading (SSR)? → Server-render the skeleton/empty state so there's no layout shift

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a dashboard at the root URL (`/`) as the default landing page, replacing the current redirect to `/record`
- **FR-002**: System MUST show a count of currently active illnesses and display a card for each active illness (name, start date, symptoms count, days elapsed)
- **FR-003**: System MUST show a friendly illustrated empty state when no active illnesses exist
- **FR-004**: System MUST display a recent-activity feed (last 10 events) showing illness created, illness resolved, and treatment added events in reverse chronological order
- **FR-005**: System MUST use relative timestamps in the activity feed ("today," "yesterday," "3 days ago," "Mar 5")
- **FR-006**: System MUST show a "View all in timeline" link when activity feed has more than 10 items
- **FR-007**: System MUST provide quick-action buttons for "Add a sick day" and "View timeline" that are always visible on the dashboard
- **FR-008**: System MUST conditionally show an "Add treatment" quick-action for each active illness
- **FR-009**: System MUST display summary stats (total illnesses, this month count, average recovery days, most common illness) when ≥1 resolved illness exists
- **FR-010**: System MUST hide or gracefully degrade the stats section when no illness records exist
- **FR-011**: System MUST show a gentle "Still going?" nudge on active illness cards older than 7 days to encourage resolution
- **FR-012**: Dashboard MUST be responsive from 320px to 1440px+, single-column on mobile, two-column on ≥768px

### Non-Functional Requirements

- **NFR-001**: Dashboard page MUST achieve Largest Contentful Paint (LCP) under 1.5 seconds on a 4G connection
- **NFR-002**: Dashboard API endpoint(s) MUST respond in under 500ms for users with up to 500 illness records
- **NFR-003**: Dashboard MUST be server-side rendered (Next.js Server Component or SSR) to avoid layout shift and improve SEO
- **NFR-004**: Dashboard MUST match the existing "warm + calm" design system (sand/cream backgrounds, teal accents, rounded corners, friendly copy)

### Key Entities

- **Dashboard View Model**: An aggregated read-only projection — not a new database table
  - Active illnesses (filtered from `Illness` where `status = 'active'`)
  - Recent events (derived from `Illness.created_at`, `Illness.date_ended`, `Treatment.created_at`)
  - Stats (computed aggregates from `Illness` and `Treatment` tables)

- **Activity Event** (virtual/derived):
  - Attributes: type (`illness_created` | `illness_resolved` | `treatment_added`), title, timestamp, related_illness_id
  - Not persisted; assembled at query time from existing tables

### New API Endpoint

- **`GET /api/dashboard`**: Returns a single payload combining active illnesses, recent activity events, and summary stats. Avoids N+1 by fetching everything in one optimized query/set of queries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users land on a meaningful overview instead of a blank redirect — bounce rate on `/` decreases compared to current behavior
- **SC-002**: Active illness cards render correctly for 0, 1, and 10+ active illnesses
- **SC-003**: Activity feed shows events in correct chronological order with accurate relative timestamps
- **SC-004**: Quick-action buttons route to the correct pages and the "Add treatment" button only appears when active illnesses exist
- **SC-005**: Stats section computes correct values: total count, monthly count, average recovery, most-common name
- **SC-006**: Dashboard loads (LCP) in under 1.5 seconds on simulated 4G
- **SC-007**: Page is fully responsive and usable at 320px, 768px, and 1440px widths
- **SC-008**: All acceptance scenarios pass as automated Playwright E2E tests
- **SC-009**: Existing unit and E2E tests continue to pass (no regressions)

## Assumptions

- Authentication / user context is unchanged — the dashboard uses the same `extractUserContext` mechanism as existing routes
- No new database tables are needed; all dashboard data is derived from existing `illnesses` and `treatments` tables
- The activity feed does not need real-time updates (a page refresh or navigation is sufficient)
- Family profiles (multi-member support) are out of scope for this feature — the dashboard shows all illnesses for the current user, not per-family-member
- The warm + calm (sand/teal) design system and family-friendly copy tone are already established and will be followed

## Open Questions

- Should the dashboard auto-refresh on an interval (e.g., every 60 seconds) or only on navigation?
- When the "Add a sick day" flow completes, should the user land back on the dashboard or stay on the record confirmation?
- Should the activity feed eventually include photo uploads as events, or keep it limited to illnesses and treatments?
