# Implementation Tasks: Health Records & Illness Tracker

**Feature**: Health Story - Illness Tracker (001-illness-tracker)  
**Generated**: 2026-03-08 via `/speckit.tasks`  
**Tech Stack**: Next.js 14, TypeScript, React 18, Tailwind CSS, PostgreSQL, Vercel Blob  
**Target**: MVP (User Stories 1, 3, 4; Story 5 deferred)

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 58 |
| Setup Phase | 8 tasks |
| Foundational Phase | 12 tasks |
| User Story 1 (Record) | 10 tasks |
| User Story 3 (History) | 9 tasks |
| User Story 2 (Photos) | 11 tasks |
| User Story 4 (Treatments) | 5 tasks |
| Polish & Cross-Cutting | 3 tasks |
| **MVP Scope** | US1, US3, US4 (Stories 2, 5 follow) |
| **Estimated Duration** | 4-6 weeks (2 developers, test-first) |
| **Parallel Opportunities** | 12 tasks can run simultaneously |

---

## User Story Dependency & Sequencing

```
┌─────────────────────────────────────────────────────────┐
│ SETUP & FOUNDATIONAL (Weeks 1-2)                       │
│ - Project initialization, DB setup, API base           │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────────┬─────────────────┐
        │                         │                 │
        ▼                         ▼                 ▼
   ┌───────────────────┐  ┌──────────────────┐  ┌──────────────┐
   │ US1: Record       │  │ US3: View        │  │ US4: Track   │
   │ Illness (Week 2-3)│  │ History (Week 3) │  │ Treatments   │
   │ [PARALLEL: P]     │  │ [PARALLEL: P]    │  │ (Week 3-4)   │
   └───────────────────┘  └──────────────────┘  └──────────────┘
        │                        │                  │
        └────────────────┬───────┴──────────────────┘
                         │
                    [PARALLEL]
                         ▼
   ┌──────────────────────────────────────────────────┐
   │ US2: Upload Photos (Week 4-5)                   │
   │ [Depends on US1 for illness records]            │
   └──────────────────┬───────────────────────────────┘
                      │
                      ▼
   ┌──────────────────────────────────────────────────┐
   │ US5: Analyze Trends (v2 - deferred)             │
   │ [Post-MVP, depends on data from US1-4]         │
   └──────────────────────────────────────────────────┘
```

**Parallel Execution Strategy**:
- Weeks 1-2: Setup + Foundational (all work in parallel on different files, no conflicts)
- Week 2-3: US1 + US3 routes can begin in parallel (US3 uses US1 data)
- Week 3-4: US1 + US3 + US4 implementation (no dependencies)
- Week 4-5: US2 photo upload (depends on US1 being testable)
- Week 5+: Polish, E2E testing, deployment

**Recommended MVP Scope**: Complete US1 + US3 + US4 for Week 4 demo; US2 for Week 5 completion.

---

## Dependencies & Blockers

### Critical Path (Blocker Order)
1. ✅ Database schema migration (T007) → All API tasks depend
2. ✅ Illness API routes (T014, T015, T016, T017, T018) → US1 form depends
3. ✅ IllnessForm component (T024) → US1 input depends
4. ✅ Illness display list/detail (T026, T027) → US3 view depends
5. ✅ Treatment API + form (T041+) → US4 depends on US1 being saved
6. ✅ PHoto upload handler (T049+) → US2 depends on US1

### Task Dependencies
- **T001-T006** (Setup): No dependencies, can start immediately
- **T007-T010** (DB): Dependent only on setup (T001-T006) ✅
- **T011-T022** (API base): Dependent on T007-T010
- **T023-T028** (US1 Form): Dependent on T014-T018
- **T029-T037** (US3 History): Dependent on T014, T016 ✅ [CAN START PARALLEL WITH US1]
- **T038-T047** (US4 Treatment): Dependent on T014, T041-T043 ✅ [CAN START PARALLEL WITH US1]
- **T048-T056** (US2 Photos): Dependent on T014, T049-T052
- Deferred: US5 trend analysis

---

## Phase 1: Setup & Environment (Week 1)

### Goal
Initialize Next.js project structure, install dependencies, configure development tools, and set up version control for feature branch.

### Independent Test Criteria
✅ Development environment runs locally with `npm run dev`  
✅ Database connection established via `npm run db:check`  
✅ TypeScript compilation passes without errors  
✅ Git branch `001-illness-tracker` is active with all config files committed

### Tasks

- [ ] T001 Initialize Next.js 14 project with TypeScript in src/
- [ ] T002 Configure Tailwind CSS with mobile-first breakpoints in tailwind.config.ts
- [ ] T003 Setup TypeScript paths and strict mode in tsconfig.json
- [ ] T004 Configure ESLint & Prettier for code consistency (rules in .eslintrc, .prettierrc)
- [ ] T005 Install core dependencies: React 18, SWR, Zod, pg (PostgreSQL client)
- [ ] T006 Create environment template file .env.example with all required variables
- [ ] T007 [P] Create initial database schema migration in db/migrations/001-initial-schema.sql
- [ ] T008 [P] Setup Jest configuration in jest.config.js with React Testing Library defaults

---

## Phase 2: Foundational Infrastructure (Week 1-2)

### Goal
Establish database connection, implement authentication middleware, create API base utilities, and set up health check endpoint for monitoring.

### Independent Test Criteria
✅ Database queries execute successfully via lib/db.ts functions  
✅ Authentication middleware prevents unauthorized API access  
✅ /api/health/check returns 200 with status information  
✅ All base utility functions have unit test coverage ≥90%  
✅ TypeScript compilation for all lib/ files passes

### Tasks

- [ ] T009 Create PostgreSQL connection pool in src/lib/db.ts (connection string from .env.local)
- [ ] T010 [P] Create database query wrapper with error handling in src/lib/db.ts
- [ ] T011 Create authentication middleware in src/lib/auth.ts (extracts user_id from context)
- [ ] T012 [P] Create API error handler utility in src/lib/errors.ts (standardized error format)
- [ ] T013 [P] Create validation utility wrapper in src/lib/validation/schemas.ts using Zod
- [ ] T014 Create Illness type definitions and TypeScript interfaces in src/types/illness.ts
- [ ] T015 [P] Create Treatment type definitions in src/types/treatment.ts
- [ ] T016 [P] Create Photo type definitions in src/types/photo.ts
- [ ] T017 Setup Vercel Blob client in src/lib/blob.ts for file uploads
- [ ] T018 [P] Create health check endpoint in app/api/health/check.ts (returns database status)
- [ ] T019 [P] Create comprehensive unit tests for lib/db.ts covering connection, queries, errors
- [ ] T020 [P] Create comprehensive unit tests for lib/validation/schemas.ts covering all entity schemas

---

## Phase 3: User Story 1 - Record Illness with Symptoms & Causes (Week 2-3)

### User Story Goal
Users can create a detailed illness record with name, date, symptoms, and cause. System validates required fields, stores data persistently, and shows confirmation to user.

### Independent Test Criteria
✅ User can fill form with illness name, date, symptoms, cause and submit  
✅ Illness record appears in database with all entered data  
✅ Validation errors display for missing required fields (name, date)  
✅ Symptoms array saves correctly with name, severity, duration  
✅ User receives confirmation message after successful save  
✅ E2E test covers: form fill → submit → confirmation → verification in DB

### Implementation Tasks

**Database & API**:

- [ ] T021 [P] [US1] Create GET /api/illnesses endpoint with pagination and filtering in app/api/illnesses/route.ts
- [ ] T022 [P] [US1] Create POST /api/illnesses endpoint with validation in app/api/illnesses/route.ts
- [ ] T023 [US1] Create GET /api/illnesses/[id] endpoint in app/api/illnesses/[id]/route.ts
- [ ] T024 [US1] Create PUT /api/illnesses/[id] endpoint for editing in app/api/illnesses/[id]/route.ts
- [ ] T025 [P] [US1] Create integration tests for illness API endpoints in tests/integration/illness-api.test.ts

**Frontend Components**:

- [ ] T026 [P] [US1] Create IllnessForm component in src/components/Forms/IllnessForm.tsx with validation
- [ ] T027 [P] [US1] Create SymptomInput sub-component for dynamic symptom list in src/components/Forms/SymptomInput.tsx
- [ ] T028 [US1] Create record/page.tsx (new illness form page) in app/(dashboard)/record/page.tsx
- [ ] T029 [P] [US1] Create unit tests for IllnessForm in tests/components/Forms/IllnessForm.test.tsx
- [ ] T030 [US1] Create component tests for SymptomInput in tests/components/Forms/SymptomInput.test.tsx

**E2E Testing**:

- [ ] T031 [US1] Create E2E test for record illness workflow in tests/e2e/01-record-illness.e2e.ts

---

## Phase 4: User Story 3 - View Illness History & Timeline (Week 3)

### User Story Goal
Users can view all past illness records organized chronologically. System displays list sorted by most recent first, allows clicking for detail view, and shows helpful message when no records exist.

### Independent Test Criteria
✅ Illness list displays all records sorted by date (most recent first)  
✅ Each illness card shows name, date range, symptom count, treatment count  
✅ Clicking illness card navigates to detail page  
✅ Detail page shows full record with symptoms, cause, treatments, photos  
✅ Empty state message displays when no records exist  
✅ E2E test covers: navigate → view list → click → view detail → back

### Implementation Tasks

**Database & API**:

- [ ] T032 [P] [US3] Create database query for listing illnesses in src/lib/db/queries.ts
- [ ] T033 [P] [US3] Create database query for fetching single illness detail (with treatments/photos) in src/lib/db/queries.ts

**Frontend Components**:

- [ ] T034 [P] [US3] Create IllnessCard component in src/components/Cards/IllnessCard.tsx (displays list item)
- [ ] T035 [P] [US3] Create IllnessList component in src/components/Lists/IllnessList.tsx (handles pagination)
- [ ] T036 [US3] Create IllnessDetail component in src/components/Detail/IllnessDetail.tsx (full record view)
- [ ] T037 [US3] Create history/page.tsx in app/(dashboard)/history/page.tsx
- [ ] T038 [P] [US3] Create unit tests for IllnessCard in tests/components/Cards/IllnessCard.test.tsx
- [ ] T039 [P] [US3] Create component tests for IllnessList in tests/components/Lists/IllnessList.test.tsx

**E2E Testing**:

- [ ] T040 [US3] Create E2E test for view history workflow in tests/e2e/03-view-history.e2e.ts

---

## Phase 5: User Story 4 - Track Treatments & Effectiveness (Week 3-4)

### User Story Goal
Users can add, edit, and track treatments for an illness record. System allows marking treatments as effective/ineffective for future reference and associates treatments with illnesses.

### Independent Test Criteria
✅ User can add treatment to existing illness (name, type, effectiveness, dates)  
✅ Treatment record saves to database and associates with correct illness  
✅ User can edit treatment to change effectiveness status  
✅ User can delete treatment from illness  
✅ Treatments display in illness detail view with clear effectiveness status  
✅ E2E test covers: view illness → add treatment → edit → save → verify

### Implementation Tasks

**Database & API**:

- [ ] T041 [P] [US4] Create POST /api/illnesses/[id]/treatments endpoint in app/api/illnesses/[id]/treatments/route.ts
- [ ] T042 [P] [US4] Create GET /api/illnesses/[id]/treatments endpoint in app/api/illnesses/[id]/treatments/route.ts
- [ ] T043 [US4] Create PUT /api/illnesses/[id]/treatments/[treatmentId] endpoint in app/api/illnesses/[id]/treatments/[treatmentId]/route.ts
- [ ] T044 [US4] Create DELETE /api/illnesses/[id]/treatments/[treatmentId] endpoint in app/api/illnesses/[id]/treatments/[treatmentId]/route.ts
- [ ] T045 [P] [US4] Create integration tests for treatment API in tests/integration/treatment-api.test.ts

**Frontend Components**:

- [ ] T046 [P] [US4] Create TreatmentForm component in src/components/Forms/TreatmentForm.tsx
- [ ] T047 [P] [US4] Create TreatmentList subcomponent in src/components/Lists/TreatmentList.tsx
- [ ] T048 [US4] Create component tests for TreatmentForm in tests/components/Forms/TreatmentForm.test.tsx

**E2E Testing**:

- [ ] T049 [US4] Create E2E test for track treatments workflow in tests/e2e/04-track-treatments.e2e.ts

---

## Phase 6: User Story 2 - Upload & Attach Photos (Week 4-5)

### User Story Goal
Users can upload photos to illness records for visual documentation. System validates file format and size, stores in Vercel Blob, and displays in gallery view.

### Independent Test Criteria
✅ User can select image file and upload to illness record  
✅ Photo saves to Vercel Blob storage and metadata saves to database  
✅ Photo appears in illness gallery/detail view  
✅ Invalid file types rejected with error message  
✅ Files >25MB rejected with file size error  
✅ E2E test covers: upload photo → verify in gallery → delete → confirm removal

### Implementation Tasks

**Database & API**:

- [ ] T050 [P] [US2] Create POST /api/illnesses/[id]/photos endpoint for upload in app/api/illnesses/[id]/photos/route.ts
- [ ] T051 [P] [US2] Create GET /api/illnesses/[id]/photos endpoint for listing in app/api/illnesses/[id]/photos/route.ts
- [ ] T052 [US2] Create DELETE /api/illnesses/[id]/photos/[photoId] endpoint in app/api/illnesses/[id]/photos/[photoId]/route.ts
- [ ] T053 [P] [US2] Create Vercel Blob upload handler in src/lib/blob/upload.ts (25MB validation, type check)
- [ ] T054 [P] [US2] Create integration tests for photo API in tests/integration/photo-api.test.ts

**Frontend Components**:

- [ ] T055 [P] [US2] Create PhotoUpload component in src/components/Forms/PhotoUpload.tsx (file input, validation, progress)
- [ ] T056 [P] [US2] Create PhotoGallery component in src/components/Cards/PhotoGallery.tsx (display uploaded photos)
- [ ] T057 [US2] Create component tests for PhotoUpload in tests/components/Forms/PhotoUpload.test.tsx
- [ ] T058 [US2] Create component tests for PhotoGallery in tests/components/Cards/PhotoGallery.test.tsx

**E2E Testing**:

- [ ] T059 [US2] Create E2E test for upload photos workflow in tests/e2e/02-upload-photos.e2e.ts

---

## Phase 7: Polish & Cross-Cutting Concerns (Week 5-6)

### Goal
Strengthen security, accessibility, performance, documentation, and deployment readiness. Ensure all components meet accessibility standards and application meets performance targets.

### Independent Test Criteria
✅ All core workflows meet WCAG 2.1 AA accessibility standards  
✅ Page load time <3s on 4G networks  
✅ All photos lazy-load with estimated size preview  
✅ Offline mode shows graceful error (no blank page)  
✅ Documentation complete: README, API docs, deployment guide  
✅ Test coverage ≥80% across all modules

### Tasks

- [ ] T060 Add security headers middleware in src/lib/middleware/security.ts (HSTS, CSP, X-Frame-Options)
- [ ] T061 [P] Implement lazy loading for photo galleries in src/components/Cards/PhotoGallery.tsx
- [ ] T062 [P] Add accessibility audit (axe) to test suite in tests/a11y/accessibility.test.ts
- [ ] T063 Run and fix ESLint/Prettier across all source files for consistency
- [ ] T064 [P] Create comprehensive README.md with architecture overview and deployment guide
- [ ] T065 [P] Create API documentation file docs/api.md with all endpoints, examples, auth headers
- [ ] T066 Update quickstart.md with actual command examples and troubleshooting for integration tests
- [ ] T067 Create deployment checklist in docs/deployment.md for Vercel push

---

## Implementation Strategy & Recommendations

### Test-First Development (Principle II: Comprehensive Testing)

**Workflow per task**:
1. Write test describing desired behavior
2. Write minimal code to pass test
3. Refactor for clarity and maintainability
4. Commit with message: `test: US1-T026 - IllegalnessForm validates required fields`

**Coverage Targets**:
- Unit tests: Core logic (validation, formatting, queries) - **Target 90%+**
- Component tests: React components, user interactions - **Target 80%+**
- Integration tests: API routes → database - **Target 75%+**
- E2E tests: Full user workflows (US1-US4) - **Target 100% of happy paths**

### Parallel Execution Opportunities

**12 Tasks can run in parallel** (no cross-file dependencies):
- **T001-T006** (Setup): All independent → **Run all in parallel**
- **T021, T032** (US1 + US3 queries): Different tables → **Run in parallel**
- **T026-T027** (US1 components): Can be developed simultaneously → **Merge at end**
- **T034-T036** (US3 components): Can be developed simultaneously → **Merge at end**
- **T041-T043** (US4 endpoints): Different routes → **Run in parallel**

**Recommended Team Assignment** (2 developers):
- **Dev A**: Setup (T001-T008) → US1 API (T021-T025) → US1 Components (T026-T030)
- **Dev B**: Foundational (T009-T020) → US3 (T032-T040) + US4 (T041-T048) in parallel

### MVP vs. Post-MVP Features

**MVP (Complete by Week 4)**:
- ✅ US1: Record Illness (core feature)
- ✅ US3: View History (enables value extraction)
- ✅ US4: Track Treatments (high user value, low complexity)

**Post-MVP v1.1 (Week 5+)**:
- 🔄 US2: Upload Photos (nice-to-have, moderate complexity)
- 🔄 US5: Analyze Trends (v2, complex analytics, deferred)

**Rationale**: Record + History + Treatments form complete workflow; photos are additive feature; trends require statistical analysis not needed for MVP.

### Code Quality Gates (Constitution Principle I & II)

Before merging to main:
1. ✅ TypeScript compilation passes without errors
2. ✅ ESLint/Prettier check passes
3. ✅ Test coverage ≥80% (measured by Jest)
4. ✅ All tests pass (unit, component, integration, E2E for story)
5. ✅ No console.error or unhandled promises
6. ✅ Accessibility audit (axe) passes for story workflow

Pre-commit hook example:
```bash
npm run type-check && npm run lint && npm run test:all && npm run a11y
```

---

## Deployment & Environment Setup

### Local Development
```bash
# Terminal 1: Database
docker-compose up -d
npm run db:check

# Terminal 2: Dev server
npm run dev
# http://localhost:3000
```

### Vercel Production Deployment
```bash
# Set environment variables in Vercel Dashboard
vercel env add DATABASE_URL
vercel env add BLOB_READ_WRITE_TOKEN

# Deploy production
vercel --prod
```

**Deployment Timeline**: After Phase 7 completion (~Week 6), branch ready for PR and production merge.

---

## Risk Mitigation

| Risk | Impact | Mitigation | Owner |
|------|--------|-----------|-------|
| Photo upload fails midway | User loses data, loses trust | Implement resumable uploads; save draft to localStorage | Dev |
| Database migration breaks prod | Service down | Test migrations locally first; have rollback plan | DB Admin |
| Performance regression | Users leave for competitor | Monitor Core Web Vitals; enforce <3s page load gate | Dev |
| Missing error handling | Support burden | Standardize error format; log all failures to Sentry | Dev |
| Mobile UX not responsive | 50% users on mobile hurt | Test on real devices (iOS/Android) early; Lighthouse checks | Design |

---

## Success Metrics (Constitution Principles Alignment)

Upon completion, verify:

✅ **Principle I (Code Quality)**: TypeScript strict mode, ESLint passes, single-responsibility components  
✅ **Principle II (Testing)**: ≥80% coverage across all modules, test-first workflow  
✅ **Principle III (Regression)**: All bug fixes include regression tests, root cause documented  
✅ **Principle IV (UX Consistency)**: WCAG 2.1 AA compliance, 44x44px touch targets, consistent Tailwind  
✅ **Principle V (Simplicity)**: 15 total dependencies, clear API contracts, documented quickstart  

---

## Task Status Template

```markdown
| Task ID | Status | Owner | ETA | Notes |
|---------|--------|-------|-----|-------|
| T001 | Not Started | — | — | — |
| T002 | In Progress | Dev A | Thu 3/9 | Tailwind mobile breakpoints configured |
| T003 | Complete | Dev B | Tue 3/8 | tsconfig.json strict mode enabled |
```

---

## Summary & Next Steps

1. **Week 1 Start**: Assign tasks to Dev A/B; begin T001-T008 in parallel
2. **Week 2**: Foundational infrastructure (T009-T020); US1 API (T021-T025)
3. **Week 3**: US1 components + E2E (T026-T031); US3 API (T032-T033) starting
4. **Week 4**: Complete US1 + US3 + US4 → Demo to stakeholders
5. **Week 5**: US2 photo upload → Code review, merging to main
6. **Week 6**: Polish, accessibility audit, pre-production testing
7. **Week 7**: Production deployment to Vercel

**MVP Launch Target**: End of Week 4 with US1, US3, US4 complete and E2E tested.
